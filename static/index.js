function toggle(btnId, loadBtnId) {
    console.log(btnId, loadBtnId)
    let btn = document.getElementById(btnId);
    let loadingBtn = document.getElementById(loadBtnId);
    btn.setAttribute("hidden", "hidden");
    loadingBtn.removeAttribute("hidden");
}