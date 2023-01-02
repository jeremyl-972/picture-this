function toggle(btnId, loadBtnId) {
    let btn = document.getElementById(btnId);
    let loadingBtn = document.getElementById(loadBtnId);
    if (btn.getAttribute('hidden') != null) {
        loadingBtn.setAttribute("hidden", "hidden");
        btn.removeAttribute("hidden");
    } 
    else {
        btn.setAttribute("hidden", "hidden");
        loadingBtn.removeAttribute("hidden");
    };
}