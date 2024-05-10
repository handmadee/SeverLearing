
document.querySelectorAll('.menu > ul > li').forEach(function (element) {
    element.addEventListener('click', function (e) {
        // remove active from already active
        this.parentNode.querySelectorAll('.active').forEach(function (activeElement) {
            activeElement.classList.remove('active');
        });

        // add active to clicked
        this.classList.toggle('active');
        // if has sub menu open it
        var subMenu = this.querySelector('ul');
        if (subMenu) {
            subMenu.style.display = subMenu.style.display === 'none' ? 'block' : 'none';
        }

        // close other sub menu if any open
        this.parentNode.querySelectorAll('ul').forEach(function (ul) {
            if (ul !== subMenu) {
                ul.style.display = 'none';
            }
        });

        // remove active class of sub menu items
        this.parentNode.querySelectorAll('ul li').forEach(function (li) {
            li.classList.remove('active');
        });
    });
});

document.querySelector('.menu-btn').addEventListener('click', function () {
    document.querySelector('.sidebar').classList.toggle('active');
    document.querySelector('.main').classList.toggle('active');
});

// Logout 
const logout = document.getElementById('logoutAdmin');
logout.addEventListener('click', (e) => {
    e.preventDefault();
    if (confirm('Bạn muốn đăng xuất dưới quyền admin atribiuter')) {
        document.cookie = `accessToken=; max-age=0; path=/;`;
        document.cookie = `refreshToken=; max-age=0; path=/;`;
        window.location.href = '/admin/auth';
    }
})