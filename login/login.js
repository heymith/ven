document.addEventListener("DOMContentLoaded", async function () {
    const loginButton = document.getElementById("login-button");
    loginButton.addEventListener("click", async function () {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            if (accounts && accounts.length > 0) {
                transitionToComHtml();
            } else {
                alert("Metamask login failed. Please try again.");
            }
        } catch (error) {
            console.error(error);
            alert("Error during Metamask login.");
        }
    });
    function transitionToComHtml() {
        const loginContainer = document.querySelector(".login-container");
        loginContainer.style.animation = "fadeOut 2s";
        setTimeout(() => {
            window.location.href = "com.html";
        }, 500);
    }
});
