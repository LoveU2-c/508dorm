// 微博式广场脚本
// 后端基地址：默认 http://localhost:3000 ，可通过 window.API_BASE_URL 覆盖
const BASE = window.API_BASE_URL || "http://localhost:3000";

let offset = 0;
const limit = 10;
let lastUploadedImageUrl = null;

function escapeHTML(s){
  return (s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
}
function linkify(s){
  return (s||'').replace(/(https?:\/\/[^\s]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>');
}

function when(ts){
  try { return new Date(ts).toLocaleString(); } catch { return ts || ''; }
}

function renderCard(p) {
  const img = p.image_url
    ? `<div class="post-image"><img src="${p.image_url.startsWith('http') ? p.image_url : (BASE + p.image_url)}" alt=""></div>`
    : '';
  return `
    <article class="post-card">
      <div class="post-head">
        <img class="avatar" src="images/zhaochenle.webp" alt="avatar">
        <div class="meta">
          <div class="author">${escapeHTML(p.author)}</div>
          <div class="time">${when(p.created_at)}</div>
        </div>
      </div>
      <div class="content">${linkify(escapeHTML(p.content))}</div>
      ${img}
      <div class="actions">
        <button class="action">转发</button>
        <button class="action">评论</button>
        <button class="action">点赞</button>
      </div>
    </article>
  `;
}

async function uploadPostImage(e){
  e.preventDefault();
  const form = document.getElementById('postUploadForm');
  const fd = new FormData(form);
  const file = fd.get('photo');
  if (!file) return alert('先选择一张图片');

  const res = await fetch(`${BASE}/api/upload-photo`, { method: 'POST', body: fd });
  const data = await res.json();
  if (!data.success) return alert('上传失败');
  lastUploadedImageUrl = data.url.startsWith('http') ? data.url : (BASE + data.url);
  document.getElementById('postImageUrl').textContent = `配图已上传：${lastUploadedImageUrl}`;
}

async function submitPost(){
  const author = document.getElementById('postAuthor').value.trim();
  const content = document.getElementById('postContent').value.trim();
  if (!author || !content) return alert('昵称与内容必填');

  const res = await fetch(`${BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author, content, image_url: lastUploadedImageUrl })
  });
  const data = await res.json();
  if (!data.success) return alert('发表失败');

  // 重置
  document.getElementById('postContent').value = '';
  document.getElementById('postImageUrl').textContent = '';
  lastUploadedImageUrl = null;

  // 刷新时间线
  offset = 0;
  document.getElementById('weiboFeed').innerHTML = '';
  await loadFeed();
}

async function loadFeed(){
  const url = `${BASE}/api/posts?offset=${offset}&limit=${limit}`;
  const res = await fetch(url);
  const arr = await res.json();
  const feed = document.getElementById('weiboFeed');
  feed.insertAdjacentHTML('beforeend', arr.map(renderCard).join(''));
  if (arr.length < limit) document.getElementById('loadMore').style.display = 'none';
  else document.getElementById('loadMore').style.display = 'block';
  offset += arr.length;
}

document.addEventListener('DOMContentLoaded', () => {
  const uploadForm = document.getElementById('postUploadForm');
  uploadForm.addEventListener('submit', uploadPostImage);
  document.getElementById('postSubmit').addEventListener('click', submitPost);
  document.getElementById('loadMore').addEventListener('click', loadFeed);

  // 初次拉取
  loadFeed();

  // 可选：每 15 秒自动刷新（简单策略：重载第一页）
  setInterval(async () => {
    offset = 0;
    document.getElementById('weiboFeed').innerHTML = '';
    await loadFeed();
  }, 15000);
});
