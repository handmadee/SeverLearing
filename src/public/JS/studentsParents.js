import { LOCALHOST_API_URL } from "./config.js";

document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE_URL = LOCALHOST_API_URL;

    const getLanguages = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}language`);
            const data = await response.json();
            return data || [];
        } catch (error) {
            console.error("Error fetching languages:", error);
            return [];
        }
    };

    const getTopics = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}topics`);
            const data = await response.json();
            return data?.data || [];
        } catch (error) {
            console.error("Error fetching topics:", error);
            return [];
        }
    };

    const getFeedBackByIdForMonth = async (id, month) => {
        try {
            const response = await fetch(
                `${API_BASE_URL}feedback/students/${id}?month=${month}`
            );
            const data = await response.json();
            return data?.data?.data || [];
        } catch (error) {
            console.error("Error fetching feedback:", error);
            return [];
        }
    };

    const getStudentTopics = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}student-topics/${id}`);
            const data = await response.json();
            return data?.data || [];
        } catch (error) {
            console.error("Error fetching student topics:", error);
            console.log("🚀 ~ getAllFeedBack ~ response:", response)
            return [];
        }
    };

    const getAllFeedBack = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/feedbackStudents/${id}`);
            const data = await response.json();
            return data?.data?.data;
        } catch (error) {
            console.error("Error fetching all feedback:", error);
            return [];
        }
    };

    const loading = (contentClass) => {
        contentClass.innerHTML = `
            <div style="position: absolute;" class="d-flex mx-2 col-12 justify-content-center">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
            </div>
        `;
    };

    const renderTable = (tableWrapper, data = [], languages = []) => {
        if (!data.length || !languages.length) {
            tableWrapper.innerHTML = `<p style="text-align: center;">Không có dữ liệu.</p>`;
            return;
        }

        const tableHTML = data
            .map((student) => {
                // Determine active levels based on subjectScores
                const activeLevels = {};
                if (student?.subjectScores) {
                    student.subjectScores.forEach(score => {
                        if (score.score >= 0) { // If they're learning (0) or have learned (>0)
                            activeLevels[score.level] = true;
                        }
                    });
                }

                return `
            <table class="progressTable">
                <thead>
                    <tr>
                        <th>Level</th>
                        ${languages.map((lang) => `<th>${lang.nameCode}</th>`).join("")}
                    </tr>
                </thead>
                <tbody>
                    ${[1, 2, 3]
                        .map((level) => {
                            return `<tr>
                            <td>LEVEL ${level}</td>
                            ${languages
                                    .map((lang) => {
                                        if (!student?.subjectScores) {
                                            return `<td>  </td>`;
                                        }

                                        const matched = student.subjectScores.find(
                                            (score) =>
                                                score.languageIt._id === lang._id && score.level == level
                                        );
                                        const states = {
                                            learned: {
                                                content: "Đã học",
                                                style:
                                                    "background-color: rgba(76, 175, 80, 0.2); color: #2E7D32;",
                                            },
                                            learning: {
                                                content: "Đang học",
                                                style:
                                                    "background-color: rgba(255, 193, 7, 0.2); color: #856404;",
                                            },
                                            notLearned: {
                                                content: "",
                                                style:
                                                    "background-color: rgba(108, 117, 125, 0.1); color: #6c757d;",
                                            },
                                        };

                                        const state =
                                            matched?.score > 0
                                                ? states.learned
                                                : matched?.score === 0
                                                    ? states.learning
                                                    : states.notLearned;

                                        return `<td style="${state.style}">${state.content}</td>`;
                                    })
                                    .join("")}
                        </tr>`;
                        })
                        .join("")}
                </tbody>
            </table>
            <div class="topic-progress-container">
                <h4 class="section-title">CHỦ ĐỀ HỌC TẬP</h4>
                <div class="topic-progress-wrapper">
                    ${renderTopicProgress(student.studentTopics || [], activeLevels)}
                </div>
            </div>
            <div class="feedback-section">
                <div class="evaluation-card">
                    <div class="skills-assessment">
                        <h4 class="section-title">KỸ NĂNG HỌC TẬP</h4>
                        <div class="skills-grid">
                            <div class="skill-item">
                                <span>Kỹ năng lập trình</span>
                                <div class="rating">
                                    <label class="${student?.thinking && student?.skill?.includes("good") ? "active" : ""}">Tốt</label>
                                    <label class="${student?.thinking && student?.skill?.includes("rather") ? "active" : ""}">Khá</label>
                                    <label class="${student?.thinking && student?.skill?.includes("medium") ? "active" : ""}">Trung bình</label>
                                </div>
                            </div>
                            <div class="skill-item">
                                <span>Tư duy môn học</span>
                                <div class="rating">
                                    <label class="${student?.thinking && student?.thinking.includes("good") ? "active" : ""}">Tốt</label>
                                    <label class="${student?.thinking && student?.thinking.includes("rather") ? "active" : ""}">Khá</label>
                                    <label class="${student?.thinking && student?.thinking.includes("medium") ? "active" : ""}">Trung bình</label>
                                </div>
                            </div>
                        </div>
                    </div>
              
                    <div class="detailed-feedback">
                          ${student.contentFeedBack ?
                        `
                                    <h4 class="section-title">NHẬN XÉT CHI TIẾT</h4>

                        <div>
                                <div class="feedback-item">
                            <i class="fa-solid fa-check"></i>
                            <p> ${student.contentFeedBack || "Chưa có đánh giá"}</p>
                        </div>
                            ` : ""
                    }
                     <div class="signature">
                        <div class="date">
                            <strong>Ngày đánh giá:</strong>
                            <span>${new Date(student.createdAt).toLocaleDateString("vi-VN")}</span>
                        </div>
                        <div class="teacher">TSMART</div>
                    </div>
                        </div>                        
                    </div>
                </div>
            </div>`;
            })
            .join("");

        tableWrapper.innerHTML = tableHTML;
    };

    const renderTopicProgress = (studentTopics = [], studentActiveLevels = {}) => {
        if (!studentTopics.length) {
            return `<p class="no-data">Chưa có dữ liệu chủ đề học tập.</p>`;
        }

        // Group topics by level
        const groupedTopics = {};
        studentTopics.forEach(topic => {
            // Extract topic data from the topic property if it exists (from new API format)
            const topicData = topic.topic || topic;

            // Get level from the topic data
            const level = topicData.level || 1;
            if (!groupedTopics[level]) {
                groupedTopics[level] = [];
            }

            // Add the topic with its status
            groupedTopics[level].push({
                name: topicData.name,
                order: topicData.order || 0,
                status: topic.status || 0,
                _id: topicData._id
            });
        });

        // Determine which levels to show based on student's active levels
        let levelsToShow = [];

        // First priority: Use the student's active levels from subjects progress table
        if (Object.keys(studentActiveLevels).length > 0) {
            levelsToShow = Object.keys(studentActiveLevels).sort((a, b) => a - b);
        } else {
            // Second priority: Determine levels from topics with status 1 or 2
            const topicActiveLevels = {};
            Object.keys(groupedTopics).forEach(level => {
                const topics = groupedTopics[level];
                const hasActiveTopics = topics.some(topic => topic.status === 1 || topic.status === 2);
                if (hasActiveTopics) {
                    topicActiveLevels[level] = true;
                }
            });

            if (Object.keys(topicActiveLevels).length > 0) {
                levelsToShow = Object.keys(topicActiveLevels).sort((a, b) => a - b);
            } else {
                // Fallback: show all levels
                levelsToShow = Object.keys(groupedTopics).sort((a, b) => a - b);
            }
        }

        // Filter groupedTopics to only include levels we want to show
        const filteredGroupedTopics = {};
        levelsToShow.forEach(level => {
            if (groupedTopics[level]) {
                filteredGroupedTopics[level] = groupedTopics[level];
            }
        });

        // Sort topics within each level by order
        Object.keys(filteredGroupedTopics).forEach(level => {
            filteredGroupedTopics[level].sort((a, b) => a.order - b.order);
        });

        // Helper function to calculate progress statistics
        // Defined here so it's available when building the template
        const getProgressStats = (topics) => {
            const total = topics.length;
            const completed = topics.filter(t => t.status === 2).length;
            const inProgress = topics.filter(t => t.status === 1).length;
            const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

            return `
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${percent}%"></div>
                </div>
                <div class="progress-stats">
                    <span>${completed}/${total} (${percent}%)</span>
                </div>
            `;
        };

        return `
            <div class="topics-dashboard">
              
                <div class="topics-legend">
                    <div class="legend-item">
                        <span class="legend-indicator completed"></span>
                        <span class="legend-text">Đã hoàn thành</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-indicator in-progress"></span>
                        <span class="legend-text">Đang học</span>
                    </div>
                    <div class="legend-item">
                        <span class="legend-indicator not-started"></span>
                        <span class="legend-text">Chưa học</span>
                    </div>
                </div>

                <div class="topics-container grid-layout">
                    ${levelsToShow.map(level => {
            const topics = filteredGroupedTopics[level] || [];

            return `
                            <div class="level-column" data-level="${level}">
                                <div class="level-header">
                                    <div class="level-title">
                                        <i class="fa-solid fa-layer-group"></i>
                                        <span>Level ${level}</span>
                                    </div>
                                    <div class="level-progress">
                                        ${getProgressStats(topics)}
                                    </div>
                                </div>
                                <div class="topics-list">
                                    ${topics.map(topic => {
                const statusClass =
                    topic.status === 2 ? 'topic-completed' :
                        topic.status === 1 ? 'topic-in-progress' :
                            'topic-not-started';

                const statusText =
                    topic.status === 2 ? 'Đã hoàn thành' :
                        topic.status === 1 ? 'Đang học' :
                            'Chưa học';

                const statusIcon =
                    topic.status === 2 ? '<i class="fa-solid fa-check-circle"></i>' :
                        topic.status === 1 ? '<i class="fa-solid fa-spinner fa-spin-pulse"></i>' :
                            '<i class="fa-regular fa-circle"></i>';

                return `
                                            <div class="topic-item ${statusClass}" data-status="${topic.status}" data-id="${topic._id}">
                                                <div class="topic-number">${topic.order}</div>
                                                <div class="topic-content">
                                                    <div class="topic-name">${topic.name}</div>
                                                    <div class="topic-status">
                                                        ${statusIcon}
                                                        <span>${statusText}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
            }).join('')}
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
            <script>
                // Add event listeners for filtering
                document.querySelectorAll('.filter-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        // Remove active class from all filter buttons
                        document.querySelectorAll('.filter-btn').forEach(b => {
                            b.classList.remove('active');
                        });
                        
                        // Add active class to clicked button
                        this.classList.add('active');
                        
                        // Apply filter
                        const filter = this.dataset.filter;
                        const topicItems = document.querySelectorAll('.topic-item');
                        
                        topicItems.forEach(item => {
                            if (filter === 'all') {
                                item.style.display = '';
                            } else {
                                item.style.display = item.dataset.status === filter ? '' : 'none';
                            }
                        });
                    });
                });
                
                // Add event listeners for view switching
                document.querySelectorAll('.view-btn').forEach(btn => {
                    btn.addEventListener('click', function() {
                        document.querySelectorAll('.view-btn').forEach(b => {
                            b.classList.remove('active');
                        });
                        
                        this.classList.add('active');
                        
                        const view = this.dataset.view;
                        const container = document.querySelector('.topics-container');
                        
                        if (view === 'grid') {
                            container.classList.remove('list-layout');
                            container.classList.add('grid-layout');
                        } else {
                            container.classList.remove('grid-layout');
                            container.classList.add('list-layout');
                        }
                    });
                });
            </script>
            <style>
                .topics-dashboard {
                    font-family: 'Roboto', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
                    background-color: #f9fafb;
                    border-radius: 12px;
                    padding: 20px;
                    width: 100%;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    margin-bottom: 30px;
                }
                
                .topics-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    flex-wrap: wrap;
                    gap: 15px;
                }
                
                .topics-header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #2c3e50;
                }
                
                .topics-filter {
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    flex-wrap: wrap;
                }
                
                .filter-controls {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    flex-wrap: wrap;
                }
                
                .filter-label {
                    font-size: 14px;
                    font-weight: 500;
                    color: #5f6368;
                }
                
                .filter-buttons {
                    display: flex;
                    gap: 6px;
                }
                
                .filter-btn {
                    background-color: #fff;
                    border: 1px solid #e0e0e0;
                    border-radius: 20px;
                    padding: 6px 12px;
                    font-size: 13px;
                    font-weight: 500;
                    color: #5f6368;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .filter-btn:hover {
                    background-color: #f1f3f4;
                }
                
                .filter-btn.active {
                    background-color: #e8f0fe;
                    color: #1a73e8;
                    border-color: #bedcfd;
                }
                
                .filter-btn.status-completed.active {
                    background-color: rgba(76, 175, 80, 0.15);
                    color: #2e7d32;
                    border-color: rgba(76, 175, 80, 0.3);
                }
                
                .filter-btn.status-in-progress.active {
                    background-color: rgba(255, 193, 7, 0.15);
                    color: #f57c00;
                    border-color: rgba(255, 193, 7, 0.3);
                }
                
                .filter-btn.status-not-started.active {
                    background-color: rgba(158, 158, 158, 0.15);
                    color: #616161;
                    border-color: rgba(158, 158, 158, 0.3);
                }
                
                .view-options {
                    display: flex;
                    gap: 5px;
                }
                
                .view-btn {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 34px;
                    height: 34px;
                    border-radius: 4px;
                    border: 1px solid #e0e0e0;
                    background-color: #fff;
                    color: #5f6368;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .view-btn:hover {
                    background-color: #f1f3f4;
                }
                
                .view-btn.active {
                    background-color: #e8f0fe;
                    color: #1a73e8;
                    border-color: #bedcfd;
                }
                
                .topics-legend {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 15px;
                    margin-bottom: 20px;
                    padding: 12px 15px;
                    background-color: #fff;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }
                
                .legend-indicator {
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }
                
                .legend-indicator.completed {
                    background-color: #4caf50;
                }
                
                .legend-indicator.in-progress {
                    background-color: #ffc107;
                }
                
                .legend-indicator.not-started {
                    background-color: #e0e0e0;
                }
                
                .legend-text {
                    font-size: 13px;
                    color: #5f6368;
                }
                
                .topics-container {
                    display: grid;
                    gap: 20px;
                    transition: all 0.3s ease;
                }
                
                .topics-container.grid-layout {
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                }
                
                .topics-container.list-layout {
                    grid-template-columns: 1fr;
                }
                
                .level-column {
                    background-color: #fff;
                    border-radius: 10px;
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    border: 1px solid #e0e0e0;
                }
                
                .level-header {
                    padding: 15px;
                    background-color: #f5f7fa;
                    border-bottom: 1px solid #e0e0e0;
                }
                
                .level-title {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 10px;
                    font-weight: 600;
                    font-size: 16px;
                    color: #2c3e50;
                }
                
                .progress-bar {
                    height: 6px;
                    background-color: #eceff1;
                    border-radius: 3px;
                    overflow: hidden;
                    margin-bottom: 5px;
                }
                
                .progress-fill {
                    height: 100%;
                    background-color: #4caf50;
                    border-radius: 3px;
                    transition: width 0.3s ease;
                }
                
                .progress-stats {
                    font-size: 12px;
                    color: #5f6368;
                    text-align: right;
                }
                
                .topics-list {
                    padding: 15px;
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    max-height: 500px;
                    overflow-y: auto;
                }
                
                .topic-item {
                    display: flex;
                    gap: 12px;
                    padding: 12px;
                    border-radius: 8px;
                    border: 1px solid #e0e0e0;
                    transition: all 0.2s ease;
                }
                
                .topic-item:hover {
                    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                }
                
                .topic-number {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    font-weight: 600;
                    font-size: 14px;
                    background-color: #f1f3f4;
                    color: #5f6368;
                }
                
                .topic-content {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 5px;
                }
                
                .topic-name {
                    font-weight: 500;
                    color: #202124;
                    font-size: 14px;
                }
                
                .topic-status {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    font-size: 13px;
                    color: #5f6368;
                }
                
                /* Styling for completed topics */
                .topic-completed {
                    background-color: rgba(76, 175, 80, 0.05);
                    border-color: rgba(76, 175, 80, 0.3);
                }
                
                .topic-completed .topic-number {
                    background-color: rgba(76, 175, 80, 0.15);
                    color: #2e7d32;
                }
                
                .topic-completed .topic-status {
                    color: #2e7d32;
                }
                
                .topic-completed .topic-status i {
                    color: #4caf50;
                }
                
                /* Styling for in-progress topics */
                .topic-in-progress {
                    background-color: rgba(255, 193, 7, 0.05);
                    border-color: rgba(255, 193, 7, 0.3);
                }
                
                .topic-in-progress .topic-number {
                    background-color: rgba(255, 193, 7, 0.15);
                    color: #f57c00;
                }
                
                .topic-in-progress .topic-status {
                    color: #f57c00;
                }
                
                .topic-in-progress .topic-status i {
                    color: #ffc107;
                }
                
                /* Styling for not-started topics */
                .topic-not-started {
                    background-color: rgba(158, 158, 158, 0.03);
                    border-color: #e0e0e0;
                    opacity: 0.75;
                }
                
                .topic-not-started .topic-name {
                    color: #5f6368;
                }
                
                /* List layout specific styles */
                .topics-container.list-layout .level-column {
                    display: flex;
                    flex-direction: column;
                }
                
                .topics-container.list-layout .topics-list {
                    max-height: none;
                }
                
                /* Responsive styles */
                @media (max-width: 768px) {
                    .topics-container.grid-layout {
                        grid-template-columns: 1fr;
                    }
                    
                    .topics-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    
                    .topics-filter {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
                
                /* Animations */
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .topic-item {
                    animation: fadeIn 0.3s ease;
                }
            </style>
        `;
    };

    const idStudents = document.getElementById("IdStudent");
    const time = document.getElementById("time");
    const tableWrapper = document.getElementById("data");
    const id = idStudents.dataset.id;
    const currentMonth = new Date().getMonth() + 1;
    time.value = currentMonth;
    loading(tableWrapper);

    const languages = await getLanguages();
    const data = await getFeedBackByIdForMonth(id, currentMonth);

    // Process feedback data to include learningStatus as studentTopics
    if (data && data.length > 0) {
        data.forEach(item => {
            // Map learningStatus to studentTopics format that our UI expects
            if (item.learningStatus && item.learningStatus.length > 0) {
                item.studentTopics = item.learningStatus;
            }
        });
    }

    renderTable(tableWrapper, data, languages);
    console.log("Processed data:", data);

    time.addEventListener("change", async (event) => {
        loading(tableWrapper);
        let data = [];
        if (event.target.value === "all") {
            data = await getAllFeedBack(id);
        } else {
            data = await getFeedBackByIdForMonth(id, event.target.value);
        }

        // Process feedback data to include learningStatus as studentTopics
        if (data && data.length > 0) {
            data.forEach(item => {
                // Map learningStatus to studentTopics format that our UI expects
                if (item.learningStatus && item.learningStatus.length > 0) {
                    item.studentTopics = item.learningStatus;
                }
            });
        }

        renderTable(tableWrapper, data, languages);
    });
});
