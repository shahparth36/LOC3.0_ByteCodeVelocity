var activeProfile = document.querySelector("#activeProfile");
var activeSettings = document.querySelector("#activeSettings");

activeProfile.addEventListener("click", function () {
    if (activeSettings.classList.contains("active")) {
        activeProfile.classList.add("active");
        activeSettings.classList.remove("active");
        settingsDiv.style.display = "none";
        editDiv.style.display = "block";
    };
});

activeSettings.addEventListener("click", function () {
    if (activeProfile.classList.contains("active")) {
        activeSettings.classList.add("active");
        activeProfile.classList.remove("active");
        editDiv.style.display = "none";
        settingsDiv.style.display = "block";
    };
});