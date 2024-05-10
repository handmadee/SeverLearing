document.addEventListener("DOMContentLoaded", function () {
    const sortableColumns = document.querySelectorAll(".sortable");

    sortableColumns.forEach(column => {
        column.addEventListener("click", function () {
            const icon = this.querySelector(".fa-solid");
            icon.classList.toggle("fa-angle-up");
            icon.classList.toggle("fa-angle-down");
        });
    });
});
