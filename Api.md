BaseURL: http://localhost:3052/v1/api

// Select \* <USER> infor

# Steps to create a course

// Create Category <BaseURL/category> <Post>

{
nameCategory
}
// Create course
{
imageCourse: file
title:
detailCourse:
category_id:
},
// create chapter
{
titleChapter:
courseId:
}
// Lesson
{
titleLesson:
urlVideo:
chaptter_id: ObjectID
}
// Exam
{
title:
chaptter_id:
}
// question
{
question:
exam_id:
}
// Aswer
{
titleAnswer:
isCorrect:
question_id
}

# Select Course

/course

# Select Course id

/course/:id

# User

/user <Get> // Xem tất cả user
/user/:ID <Get> // Xem tất cả user theo id

# Trackuser

# Notification

<POST>
/notificationList

{
listNotificaiton: file
}

# Traking theo từng user

/tracking?idAccount=661ff3bb68771f17937baf98&idCourse=661ff328303544e1a821139b

{
idAccount:
idCourse:
}

# TrackingFull

 <Get Full Tracking>

/trackingFull

// traking by ID account < >

/tracking/:id
