document.addEventListener("DOMContentLoaded", () => {
    const signupform = document.getElementById("signupform");

    signupform.addEventListener("submit", async (e) => {
        e.preventDefault();

        const name = document.getElementById("name").value.trim();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmpassword").value.trim();

        if (password !== confirmPassword) {
            alert("Password do not match");
            return;
        }
        const API = "https://ornmanagement-production.up.railway.app";

        const user = {
            name: name,
            username: username,
            email: email,
            password: password
        };
        try {
            const response = await fetch("${API}/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(user)
            });

            if (response.ok) {
                alert("signup Successfully");
                window.location.href = "/login";
            }
            else {
                const msg = await response.text();
                alert(msg);
            }
        } catch (err) {
            console.error(err);
            alert("Server Error");
        }

    });
});