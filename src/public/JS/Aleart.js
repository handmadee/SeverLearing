// const buttonShows = document.querySelectorAll(' button')
// buttonShows.forEach((btn) => {
//     btn.addEventListener('click', (e) => {
//         createToast(e.target.getAttribute('class'))
//     })
// })



const toasts = {
    success: {
        icon: '<i class="fas fa-check-circle"></i>',
        msg: 'Bạn đã thêm thành công  !',
    },
    delete: {
        icon: '<i class="fas fa-check-circle"></i>',
        msg: 'Bạn đã xoá thành công  !',
    },
    error: {
        icon: '<i class="fas fa-exclamation-triangle"></i>',
        msg: 'Đã có lỗi xảy ra !',
    },
    warning: {
        icon: '<i class="fas fa-exclamation-circle"></i>',
        msg: 'Vui lòng xem lại !',
    },
    info: {
        icon: '<i class="fas fa-info-circle"></i>',
        msg: 'Vui lòng nhập đủ thông tin !',
    },
    login: {
        icon: '<i class="fas fa-info-circle"></i>',
        msg: 'Đăng nhập thất bại !',
    },
    comingsoon: {
        icon: '<i class="fas fa-exclamation-circle"></i>',
        msg: 'Chức năng đang được triển khai ',
    },
}

export function createToast(status) {
    let toast = document.createElement('div')
    toast.className = `toast123 ${status}`
    toast.innerHTML = `
    ${toasts[status].icon}
    <span class="msg">${toasts[status].msg}</span>
    <span class="countdown"></span>
    `
    document.querySelector('#toasts').appendChild(toast)
    setTimeout(() => {
        toast.style.animation = 'hide_slide 1s ease forwards'
    }, 4000)
    setTimeout(() => {
        toast.remove()
    }, 6000)
}

export const showAlert = (message, type) => {
    const alertContainer = document.getElementById('alertContainer');
    alertContainer.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
    `;
};