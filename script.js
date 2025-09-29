document.addEventListener("DOMContentLoaded", () => {
  const API_URL = "https://page-comments-worker.619416466.workers.dev/"; // 修改为你的部署地址

  const form = document.getElementById("comment-form");
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");
  const commentsList = document.getElementById("comments-list");

  // 提交评论
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const message = messageInput.value.trim();

    if (!name || !message) return;

    await fetch(API_URL + "/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, message })
    });

    nameInput.value = "";
    messageInput.value = "";
    loadComments(); // 重新加载评论
  });

  // 加载评论
  async function loadComments() {
    const res = await fetch(API_URL + "/list");
    const data = await res.json();

    commentsList.innerHTML = "";
    data.forEach(c => {
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<strong>${c.name}</strong><p>${c.message}</p>`;
      commentsList.appendChild(div);
    });
  }

  loadComments();
});
