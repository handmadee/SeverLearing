import { createToast } from './Aleart.js';
import { LOCALHOST_API_URL } from './config.js';

document.addEventListener("DOMContentLoaded", function () {
    const localhost = LOCALHOST_API_URL;
    const editButtons = document.querySelectorAll(".btn-edit");
    const deleteButtons = document.querySelectorAll(".btn-delete");
    const showInfoButtons = document.querySelectorAll(".btn-infor");
    const showModalInfo = document.querySelector('#studentModal');
    const closeBtn = document.querySelector('#closeModal');
    const closeMore = document.querySelector('#CloseInfor');
    const cancelBtn = document.querySelector('#cancelPopUp');
    const avatarView = document.querySelector('#student-avatar-view');
    const saveBtn = document.querySelector('#saveInfor');
    const showInfo = document.getElementById('studentInfoModal');
    const roleUser = document.getElementById('student-role');

    editButtons.forEach(button => {
        button.addEventListener("click", function (e) {
            const studentId = e.target.value;
            console.log(studentId);
            fetchStudentInfo(studentId);
        });
    });
    deleteButtons.forEach(button => {
        button.addEventListener("click", function () {
            const studentId = this.dataset.value1;
            const accountID = this.dataset.value2;
            deleteStudent(studentId, accountID);
        });
    });
    showInfoButtons.forEach(button => {
        button.addEventListener("click", function (e) {

            const studentId = e.target.dataset.accountid;
            const fullName = e.target.dataset.name;
            const avatar = e.target.dataset.avatar;
            const score = e.target.dataset.scorce;
            const quiz = e.target.dataset.exam;
            const learn = e.target.dataset.courselearn;
            const finish = e.target.dataset.coursefinish;
            const course = e.target.dataset.course;
            console.log(studentId, fullName, avatar, score, quiz, learn, finish, course);
            fetchStudentInfoMore(studentId, fullName, avatar, score, quiz, learn, finish, course);
        });
    });

    cancelBtn.addEventListener('click', function () {
        showModalInfo.classList.remove('show');
    });

    closeBtn.addEventListener('click', function () {
        showModalInfo.classList.remove('show');
    });
    closeMore.addEventListener('click', () => {
        showInfo.classList.remove('show');
    })


    async function fetchStudentInfo(studentId) {
        try {
            const response = await fetch(`${localhost}auth/user/${studentId}`);
            const data = await response.json();
            const student = data?.data?.data?.info;
            const role = data?.data?.data?.pemission;
            displayStudentInfoInModal12(student, role);
        } catch (error) {
            createToast('error');
            console.log(error);
        }
    }

    function displayStudentInfoInModal12(student, role) {
        showModalInfo.classList.add('show');
        document.getElementById('student-fullname').value = student?.fullname || '';
        document.getElementById('student-email').value = student?.email || '';
        document.getElementById('student-phone').value = student?.phone || '';
        role && role.length > 0 ? document.getElementById('student-role').value = role[0] : '';

        avatarView.src = student?.avatar || '';
        const avatarInput = document.getElementById('student-avatar');
        avatarInput.addEventListener('change', function (e) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onload = function () {
                avatarView.src = reader.result;
            }
            reader.readAsDataURL(file);
        });
        saveBtn.addEventListener('click', function () {
            updateStudentInfo(student._id);
        });
    }

    async function updateStudentInfo(studentId) {
        const formData = new FormData();
        formData.append('fullname', document.getElementById('student-fullname').value);
        formData.append('email', document.getElementById('student-email').value);
        formData.append('phone', document.getElementById('student-phone').value);
        formData.append('avatar', document.getElementById('student-avatar').files[0]);
        // Validate 
        if (!formData.get('fullname') || !formData.get('email') || !formData.get('phone')) {
            createToast('error');
            return;
        }
        try {
            const response = await fetch(`${localhost}user/${studentId}`, {
                method: 'PUT',
                body: formData
            });
            const informationUser = await response.json();
            if (informationUser) {
                const id = informationUser?.data?.data?.accountId;
                const role = roleUser.value;
                const response = await fetch(`${localhost}auth/role/${id}`, {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        pemission: [role]
                    })
                });
                const data = await response.json();

                if (data) {
                    console.log(data);
                    createToast('success');
                    location.reload();
                }
                if (!response.ok) {
                    throw new Error('Cập nhật role thất bại');
                }
            } else {
                createToast('error');
            }
        } catch (error) {
            createToast('error');
            console.error('Error:', error);
        }
    }

    async function deleteStudent(studentId, accountID) {
        const confirmed = await confirmDeleteDialog();
        if (!confirmed) return;

        try {
            // Xoá thông tin của sinh viên
            const response1 = await fetch(`${localhost}/user/${accountID}`, {
                method: 'DELETE',
            });
            if (!response1.ok) {
                throw new Error('Xoá thông tin sinh viên thất bại');
            }
            // Xoá tài khoản của sinh viên
            const response2 = await fetch(`${localhost}/deleteAccount/${studentId}`, {
                method: 'DELETE',
            });
            if (!response2.ok) {
                throw new Error('Xoá tài khoản sinh viên thất bại');
            }
            alert('Xoá thành công');
            location.reload();
        } catch (error) {
            createToast('error');
            console.error('Lỗi:', error.message);
        }
    }

    async function confirmDeleteDialog() {
        return new Promise(resolve => {
            const confirmed = confirm('Bạn có chắc chắn muốn xoá sinh viên này không ?');
            resolve(confirmed);
        });
    }

    async function fetchStudentInfoMore(studentId, fullName, avatar, score, quiz, learn, finish, course) {
        try {
            const [rankResponse, examResponse, courseLearnResponse, courseFinishResponse] = await Promise.all([
                fetch(`${localhost}trackingQuiz/ranking/user/${studentId}`),
                fetch(`${localhost}trackingQuiz/selectExam/${studentId}`),
                fetch(`${localhost}trackingLearn/${studentId}`),
                fetch(`${localhost}trackingFinish/${studentId}`)
            ]);
            const [rankData, examData, courseLearnData, courseFinishData] = await Promise.all([
                rankResponse.json(),
                examResponse.json(),
                courseLearnResponse.json(),
                courseFinishResponse.json()
            ])
            displayStudentInfoInModal(fullName, avatar, score, quiz, learn,
                finish, course,
                rankData?.data?.data,
                examData?.data?.data,
                courseLearnData?.data?.data,
                courseFinishData?.data?.data);

        } catch (error) {
            createToast('error');
            console.log(error);
        }
    }

    function displayStudentInfoInModal(fullName, avatar, score, quiz, learn, finish, course,
        rankData, examData,
        courseLearnData,
        courseFinishData) {
        // Render thông tin cơ bản của học sinh
        document.getElementById('avatarMore').src = avatar;
        document.getElementById('nameStudents').innerText = fullName;
        document.getElementById('score').innerText = score;
        document.getElementById('rank').innerText = rankData;
        document.getElementById('numTests').innerText = quiz;
        document.getElementById('numCourses').innerText = course;
        document.getElementById('numCoursesCompleted').innerText = finish;
        document.getElementById('numCoursesInProgress').innerText = learn;
        renderCoursesInProgress(courseLearnData);
        renderCoursesCompleted(courseFinishData);
        renderQuizzes(examData);
        showInfo.classList.add('show');
    }

    function renderCoursesInProgress(courseLearnData) {
        const coursesInProgressTable = document.getElementById('coursesInProgressTable');
        coursesInProgressTable.innerHTML = '';
        if (courseLearnData.length === 0) {
            coursesInProgressTable.innerHTML = '<tr><td colspan="3">Chưa có khoá học nào đang học</td></tr>';
        }
        courseLearnData.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
          <td>${course?.courseID?.title}</td>
       <td  style = 
       "
        text-align: center;
        font-weight: bold;
       "  >${course?.completedLessonsCount}</td>
         <td  style = 
       "
        text-align: center;
        font-weight: bold;
       "  >${course?.courseID?.totalLesson}</td>
        `;
            coursesInProgressTable.appendChild(row);
        });
    }

    function renderCoursesCompleted(courseFinishData) {
        console.log(courseFinishData)

        const coursesCompletedTable = document.getElementById('coursesCompletedTable');
        coursesCompletedTable.innerHTML = '';
        if (courseFinishData.length === 0) {
            coursesCompletedTable.innerHTML = '<tr><td colspan="3">Chưa có khoá học nào đưọc hoàn thành</td></tr>';
        }
        courseFinishData.forEach(course => {
            const row = document.createElement('tr');
            row.innerHTML = `
         <td>${course?.courseID?.title}</td>
           <td  style = 
       "
        text-align: center;
        font-weight: bold;
       "  >${course?.completedLessonsCount}</td>
         <td  style = 
       "
        text-align: center;
        font-weight: bold;
       "  >${course?.courseID?.totalLesson}</td>
        `;
            coursesCompletedTable.appendChild(row);
        });
    }

    function renderQuizzes(quiz) {
        const quizzesTable = document.getElementById('quizzesTable');
        console.log(quiz)
        quizzesTable.innerHTML = '';
        if (quizzesTable.length === 0) {
            coursesCompletedTable.innerHTML = '<tr><td colspan="3">Chưa có khoá học nào đưọc hoàn thành</td></tr>';
        }
        quiz.forEach(quiz => {
            const row = document.createElement('tr');
            row.innerHTML = `
      <td>${quiz?.quizID?.title}</td>
      <td  style = 
       "
        text-align: center;
        font-weight: bold;
       "  >
      ${quiz?.Score}/${quiz?.quizID?.points}</td>
    `;

            quizzesTable.appendChild(row);
        });
    }

});