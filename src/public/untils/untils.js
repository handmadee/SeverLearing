export const UTILS = {
  formatDate: (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  showLoading: () => {
    const spinner = `
      <tr>
        <td colspan="6" class="text-center p-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Đang tải...</span>
          </div>
          <div class="loading-text mt-3">Đang tải kết quả...</div>
        </td>
      </tr>
    `;
    document.getElementById('examTableBody').innerHTML = spinner;
  },

  showError: (message) => {
    const error = `
      <tr>
        <td colspan="6" class="text-center p-4">
          <div class="alert alert-danger mb-0">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            ${message}
          </div>
        </td>
      </tr>
    `;
    document.getElementById('examTableBody').innerHTML = error;
  }
};
