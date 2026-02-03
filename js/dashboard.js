/**
 * Business Dashboard JavaScript
 */

// State management
let recordingState = {
  isRecording: false,
  currentItemId: null,
  mediaRecorder: null,
  audioChunks: [],
  recordings: {} // Store recordings by item ID
};

// Initialize dashboard
document.addEventListener('DOMContentLoaded', () => {
  console.log('🏖️ Dashboard initialized');

  // Set initial tab
  showTab('overview');

  // Check for microphone permission
  checkMicrophonePermission();
});

/**
 * Show dashboard tab
 */
function showTab(tabName) {
  // Hide all tabs
  const tabs = document.querySelectorAll('.dashboard-tab');
  tabs.forEach(tab => tab.classList.remove('active'));

  // Remove active state from all nav buttons
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => btn.classList.remove('active'));

  // Show selected tab
  const selectedTab = document.getElementById(`tab-${tabName}`);
  if (selectedTab) {
    selectedTab.classList.add('active');
  }

  // Set active nav button
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    if (btn.textContent.toLowerCase().includes(tabName.replace('-', ' '))) {
      btn.classList.add('active');
    }
  });

  console.log(`📑 Switched to tab: ${tabName}`);
}

/**
 * Check microphone permission
 */
async function checkMicrophonePermission() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => track.stop());
    console.log('✅ Microphone permission granted');
  } catch (error) {
    console.warn('⚠️ Microphone permission denied:', error);
  }
}

/**
 * Start recording voice for menu item
 */
async function startRecording(itemId) {
  if (recordingState.isRecording) {
    alert('Already recording! Please stop the current recording first.');
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    recordingState.mediaRecorder = new MediaRecorder(stream);
    recordingState.audioChunks = [];
    recordingState.currentItemId = itemId;
    recordingState.isRecording = true;

    recordingState.mediaRecorder.addEventListener('dataavailable', event => {
      recordingState.audioChunks.push(event.data);
    });

    recordingState.mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(recordingState.audioChunks, { type: 'audio/webm' });
      const audioUrl = URL.createObjectURL(audioBlob);

      // Store recording
      recordingState.recordings[itemId] = {
        blob: audioBlob,
        url: audioUrl,
        duration: recordingState.audioChunks.length
      };

      // Update UI
      updateRecordingUI(itemId, 'recorded');

      // Stop all tracks
      stream.getTracks().forEach(track => track.stop());

      recordingState.isRecording = false;
      recordingState.currentItemId = null;

      console.log(`✅ Recording saved for item ${itemId}`);
    });

    // Start recording
    recordingState.mediaRecorder.start();

    // Update UI
    updateRecordingUI(itemId, 'recording');

    // Auto-stop after 30 seconds
    setTimeout(() => {
      if (recordingState.isRecording && recordingState.currentItemId === itemId) {
        stopRecording(itemId);
        alert('Recording automatically stopped after 30 seconds (max length)');
      }
    }, 30000);

    console.log(`🎤 Started recording for item ${itemId}`);

  } catch (error) {
    console.error('❌ Error starting recording:', error);
    alert('Unable to access microphone. Please check permissions.');
  }
}

/**
 * Stop recording
 */
function stopRecording(itemId) {
  if (recordingState.mediaRecorder && recordingState.isRecording) {
    recordingState.mediaRecorder.stop();
  }
}

/**
 * Play recording
 */
function playRecording(itemId) {
  const recording = recordingState.recordings[itemId];

  if (recording) {
    const audio = new Audio(recording.url);
    audio.play();
    console.log(`▶️ Playing recording for item ${itemId}`);

    // Visual feedback
    const playBtn = document.getElementById(`play-btn-${itemId}`);
    if (playBtn) {
      const originalText = playBtn.textContent;
      playBtn.textContent = '⏸️ Playing...';
      playBtn.disabled = true;

      audio.addEventListener('ended', () => {
        playBtn.textContent = originalText;
        playBtn.disabled = false;
      });
    }
  } else {
    alert('No recording available for this item.');
  }
}

/**
 * Delete recording
 */
function deleteRecording(itemId) {
  if (confirm('Are you sure you want to delete this recording?')) {
    if (recordingState.recordings[itemId]) {
      URL.revokeObjectURL(recordingState.recordings[itemId].url);
      delete recordingState.recordings[itemId];

      updateRecordingUI(itemId, 'none');
      console.log(`🗑️ Recording deleted for item ${itemId}`);
    }
  }
}

/**
 * Update recording UI
 */
function updateRecordingUI(itemId, state) {
  const recordBtn = document.getElementById(`record-btn-${itemId}`);
  const playBtn = document.getElementById(`play-btn-${itemId}`);
  const deleteBtn = document.getElementById(`delete-btn-${itemId}`);
  const status = document.getElementById(`status-${itemId}`);

  if (!recordBtn || !playBtn || !deleteBtn || !status) return;

  switch (state) {
    case 'recording':
      recordBtn.textContent = '⏹️ Stop Recording';
      recordBtn.onclick = () => stopRecording(itemId);
      recordBtn.style.background = '#ef4444';
      playBtn.disabled = true;
      deleteBtn.disabled = true;
      status.textContent = 'Recording... (30 sec max)';
      status.style.color = '#ef4444';
      break;

    case 'recorded':
      recordBtn.textContent = '🎤 Re-record';
      recordBtn.onclick = () => startRecording(itemId);
      recordBtn.style.background = '';
      playBtn.disabled = false;
      deleteBtn.disabled = false;
      status.textContent = 'Recording saved ✓';
      status.style.color = '#10b981';
      break;

    case 'none':
      recordBtn.textContent = '🎤 Record Story';
      recordBtn.onclick = () => startRecording(itemId);
      recordBtn.style.background = '';
      playBtn.disabled = true;
      deleteBtn.disabled = true;
      status.textContent = 'No recording yet';
      status.style.color = '#64748b';
      break;
  }
}

/**
 * Edit menu item
 */
function editMenuItem(itemId) {
  console.log(`✏️ Editing menu item ${itemId}`);
  alert('Edit functionality would open a detailed editor modal here.');
}

/**
 * Toggle item active/inactive
 */
function toggleItemActive(itemId) {
  console.log(`👁️ Toggling visibility for item ${itemId}`);
  alert('This would toggle whether the item appears on the live menu.');
}

/**
 * Add new menu item
 */
function addNewMenuItem() {
  console.log('➕ Adding new menu item');
  alert('This would open a form to add a new menu item with all details.');
}

/**
 * Q&A Functions
 */
function addNewQA() {
  console.log('➕ Adding new Q&A');
  alert('This would open a form to add a new question and answer pair.');
}

function editQA(qaId) {
  console.log(`✏️ Editing Q&A ${qaId}`);
  alert('This would open the Q&A editor.');
}

function deleteQA(qaId) {
  if (confirm('Are you sure you want to delete this Q&A?')) {
    console.log(`🗑️ Deleting Q&A ${qaId}`);
    alert('Q&A would be deleted.');
  }
}

function recordQA(qaId) {
  console.log(`🎤 Recording Q&A answer ${qaId}`);
  alert('This would start voice recording for this Q&A (for staff training mode).');
}

function playQARecording(qaId) {
  console.log(`▶️ Playing Q&A recording ${qaId}`);
  alert('This would play the recorded answer.');
}

/**
 * Event Functions
 */
function addNewEvent() {
  console.log('➕ Adding new event');
  alert('This would open a form to create a new event with date, description, etc.');
}

/**
 * Marketing Functions
 */
function regenerateMessage() {
  console.log('🔄 Regenerating SMS message with AI');
  alert('AI would generate a new version of the campaign message.');
}

function sendCampaign() {
  if (confirm('Send this campaign to 3,847 subscribers now?')) {
    console.log('📤 Sending SMS campaign');
    alert('Campaign would be sent! You would see real-time delivery stats.');
  }
}

/**
 * Save all changes
 */
function saveAllChanges() {
  console.log('💾 Saving all changes');

  // Simulate save
  const saveBtn = event.target;
  const originalText = saveBtn.textContent;

  saveBtn.textContent = '⏳ Saving...';
  saveBtn.disabled = true;

  setTimeout(() => {
    saveBtn.textContent = '✓ Saved!';
    saveBtn.style.background = '#10b981';

    setTimeout(() => {
      saveBtn.textContent = originalText;
      saveBtn.disabled = false;
      saveBtn.style.background = '';
    }, 2000);

    alert('All changes saved successfully! Live page updated.');
  }, 1500);
}

/**
 * AI INTERVIEW FUNCTIONS
 */

// Interview state
let interviewState = {
  isActive: false,
  isRecordingAnswer: false,
  currentQuestionIndex: 0,
  answers: {},
  recognition: null,
  synthesis: window.speechSynthesis
};

// Interview questions organized by category
const interviewQuestions = [
  // Restaurant Basics (5 questions)
  { category: 'Restaurant Basics', question: "Let's start with the basics. What's the name of your restaurant?" },
  { category: 'Restaurant Basics', question: "Great! Can you tell me your restaurant's tagline or motto?" },
  { category: 'Restaurant Basics', question: "What type of cuisine do you serve?" },
  { category: 'Restaurant Basics', question: "What's your restaurant's phone number and address?" },
  { category: 'Restaurant Basics', question: "What are your hours of operation?" },

  // Your Story (3 questions)
  { category: 'Your Story', question: "Tell me about how your restaurant got started. What's the story behind it?" },
  { category: 'Your Story', question: "What makes your restaurant special or unique in the area?" },
  { category: 'Your Story', question: "What's your personal connection to this restaurant?" },

  // Menu Items (10 questions)
  { category: 'Menu Items', question: "What's your #1 most popular dish? Tell me everything about it!" },
  { category: 'Menu Items', question: "What's another signature dish I should know about?" },
  { category: 'Menu Items', question: "Do you have any dishes with interesting stories behind them?" },
  { category: 'Menu Items', question: "What appetizer do you recommend?" },
  { category: 'Menu Items', question: "Tell me about your best seafood or protein dish." },
  { category: 'Menu Items', question: "What's a great vegetarian or lighter option?" },
  { category: 'Menu Items', question: "Do you have a kids menu? What's on it?" },
  { category: 'Menu Items', question: "What dessert should people save room for?" },
  { category: 'Menu Items', question: "Where do your main ingredients come from?" },
  { category: 'Menu Items', question: "Any items that are locally-sourced or farm-to-table?" },

  // Drinks & Specials (4 questions)
  { category: 'Drinks & Specials', question: "What are your signature drinks or cocktails?" },
  { category: 'Drinks & Specials', question: "Do you have daily specials? Tell me about them." },
  { category: 'Drinks & Specials', question: "What's your happy hour like?" },
  { category: 'Drinks & Specials', question: "Any special events you host regularly?" },

  // Common Questions (3 questions)
  { category: 'Common Questions', question: "What should first-time visitors order?" },
  { category: 'Common Questions', question: "Do you accommodate dietary restrictions like gluten-free or vegan?" },
  { category: 'Common Questions', question: "Any insider tips for customers? Best time to visit, parking secrets, etc?" }
];

/**
 * Start the AI interview
 */
function startInterview() {
  interviewState.isActive = true;
  interviewState.currentQuestionIndex = 0;
  interviewState.answers = {};

  // Show interview section
  document.getElementById('interview-active').style.display = 'grid';
  document.getElementById('start-interview-btn').style.display = 'none';

  // Initialize speech recognition
  initializeInterviewVoice();

  // Load first question
  loadQuestion(0);

  // Speak the first question
  speakQuestion(interviewQuestions[0].question);

  console.log('🎙️ AI Interview started');
}

/**
 * Initialize voice recognition for interview
 */
function initializeInterviewVoice() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (SpeechRecognition) {
    interviewState.recognition = new SpeechRecognition();
    interviewState.recognition.continuous = false;
    interviewState.recognition.interimResults = true;
    interviewState.recognition.lang = 'en-US';

    interviewState.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');

      // Update answer display
      const answerDisplay = document.getElementById('answer-display');
      answerDisplay.classList.add('has-answer');
      answerDisplay.innerHTML = `<p>${transcript}</p>`;

      // If final result, save and enable next button
      if (event.results[0].isFinal) {
        interviewState.answers[interviewState.currentQuestionIndex] = transcript;
        document.getElementById('next-question-btn').disabled = false;
        document.getElementById('record-answer-btn').querySelector('.btn-text').textContent = 'Re-record Answer';
        interviewState.isRecordingAnswer = false;
        updateRecordButton(false);
      }
    };

    interviewState.recognition.onerror = (event) => {
      console.error('Voice recognition error:', event.error);
      interviewState.isRecordingAnswer = false;
      updateRecordButton(false);
    };

    interviewState.recognition.onend = () => {
      interviewState.isRecordingAnswer = false;
      updateRecordButton(false);
    };
  }
}

/**
 * Load a question
 */
function loadQuestion(index) {
  const question = interviewQuestions[index];

  // Update question display
  document.getElementById('question-category').textContent = question.category;
  document.getElementById('ai-question').textContent = question.question;

  // Check if answer already exists
  const answerDisplay = document.getElementById('answer-display');
  if (interviewState.answers[index]) {
    answerDisplay.classList.add('has-answer');
    answerDisplay.innerHTML = `<p>${interviewState.answers[index]}</p>`;
    document.getElementById('next-question-btn').disabled = false;
  } else {
    answerDisplay.classList.remove('has-answer');
    answerDisplay.innerHTML = '<p class="answer-placeholder">Click "Record Answer" to speak your response...</p>';
    document.getElementById('next-question-btn').disabled = true;
  }

  // Update progress
  updateInterviewProgress();

  // Update category list
  updateCategoryList();
}

/**
 * Speak a question using TTS
 */
function speakQuestion(text) {
  // Stop any ongoing speech
  interviewState.synthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.0;
  utterance.pitch = 1.0;
  utterance.volume = 1.0;

  interviewState.synthesis.speak(utterance);
}

/**
 * Record answer to current question
 */
function recordAnswer() {
  if (!interviewState.recognition) {
    alert('Voice recognition not available. Please check your browser permissions.');
    return;
  }

  if (interviewState.isRecordingAnswer) {
    // Stop recording
    interviewState.recognition.stop();
    return;
  }

  // Start recording
  interviewState.isRecordingAnswer = true;
  updateRecordButton(true);

  // Stop any ongoing speech
  interviewState.synthesis.cancel();

  // Clear previous answer display
  const answerDisplay = document.getElementById('answer-display');
  answerDisplay.classList.remove('has-answer');
  answerDisplay.innerHTML = '<p class="answer-placeholder">Listening... speak your answer now</p>';

  // Start recognition
  try {
    interviewState.recognition.start();
  } catch (error) {
    console.error('Error starting recognition:', error);
    interviewState.isRecordingAnswer = false;
    updateRecordButton(false);
  }
}

/**
 * Update record button state
 */
function updateRecordButton(isRecording) {
  const btn = document.getElementById('record-answer-btn');
  const indicator = document.getElementById('listening-indicator');

  if (isRecording) {
    btn.classList.add('recording');
    btn.querySelector('.btn-text').textContent = 'Stop Recording';
    indicator.classList.add('recording');
    indicator.textContent = 'Recording...';
  } else {
    btn.classList.remove('recording');
    btn.querySelector('.btn-text').textContent = 'Record Answer';
    indicator.classList.remove('recording');
    indicator.textContent = 'Listening...';
  }
}

/**
 * Move to next question
 */
function nextQuestion() {
  const nextIndex = interviewState.currentQuestionIndex + 1;

  if (nextIndex < interviewQuestions.length) {
    interviewState.currentQuestionIndex = nextIndex;
    loadQuestion(nextIndex);
    speakQuestion(interviewQuestions[nextIndex].question);
  } else {
    // Interview complete!
    completeInterview();
  }
}

/**
 * Skip current question
 */
function skipQuestion() {
  nextQuestion();
}

/**
 * Pause interview
 */
function pauseInterview() {
  if (confirm('Pause the interview? Your progress will be saved and you can resume anytime.')) {
    interviewState.isActive = false;
    interviewState.synthesis.cancel();
    if (interviewState.recognition) {
      interviewState.recognition.stop();
    }
    document.getElementById('interview-active').style.display = 'none';
    document.getElementById('start-interview-btn').style.display = 'block';
    document.getElementById('start-interview-btn').textContent = '▶️ Resume Interview';

    alert('Interview paused. Click "Resume Interview" to continue where you left off.');
  }
}

/**
 * Complete interview
 */
function completeInterview() {
  // Stop everything
  interviewState.synthesis.cancel();
  if (interviewState.recognition) {
    interviewState.recognition.stop();
  }

  // Update progress to 100%
  const answeredCount = Object.keys(interviewState.answers).length;
  updateInterviewProgress();

  // Show completion message
  alert(`🎉 Interview Complete!\n\nYou answered ${answeredCount} out of ${interviewQuestions.length} questions.\n\nYour responses have been saved and your AI is now trained with your voice and personality!`);

  // Hide interview section
  document.getElementById('interview-active').style.display = 'none';
  document.getElementById('start-interview-btn').style.display = 'block';
  document.getElementById('start-interview-btn').textContent = '🎤 Start New Interview';
  document.getElementById('preview-btn').style.display = 'inline-block';

  console.log('✅ Interview completed', interviewState.answers);
}

/**
 * Update interview progress
 */
function updateInterviewProgress() {
  const answeredCount = Object.keys(interviewState.answers).length;
  const total = interviewQuestions.length;
  const percentage = Math.round((answeredCount / total) * 100);

  const progressFill = document.getElementById('interview-progress');
  const progressText = document.querySelector('.progress-text');

  if (progressFill) {
    progressFill.style.width = `${percentage}%`;
    progressFill.textContent = `${percentage}%`;
  }

  if (progressText) {
    progressText.textContent = `${answeredCount} of ${total} questions completed`;
  }
}

/**
 * Update category list progress
 */
function updateCategoryList() {
  const categoryItems = document.querySelectorAll('.category-item');
  const categoryCounts = {};

  // Count answered questions per category
  interviewQuestions.forEach((q, index) => {
    if (!categoryCounts[q.category]) {
      categoryCounts[q.category] = { total: 0, answered: 0 };
    }
    categoryCounts[q.category].total++;
    if (interviewState.answers[index]) {
      categoryCounts[q.category].answered++;
    }
  });

  // Update UI
  categoryItems.forEach(item => {
    const categoryName = item.querySelector('.category-name').textContent;
    const progressSpan = item.querySelector('.category-progress');

    if (categoryCounts[categoryName]) {
      const { answered, total } = categoryCounts[categoryName];
      progressSpan.textContent = `${answered}/${total}`;

      // Mark as completed if all answered
      if (answered === total) {
        item.classList.add('completed');
        item.classList.remove('active');
      }
    }

    // Set active based on current question
    const currentCategory = interviewQuestions[interviewState.currentQuestionIndex].category;
    if (categoryName === currentCategory) {
      item.classList.add('active');
    } else if (!item.classList.contains('completed')) {
      item.classList.remove('active');
    }
  });
}

/**
 * Review previous interview
 */
function reviewInterview(sessionId) {
  console.log('Reviewing interview session:', sessionId);
  alert('This would show all the questions and answers from that interview session.');
}

/**
 * Export interview data
 */
function exportInterview(sessionId) {
  console.log('Exporting interview session:', sessionId);
  alert('This would export the interview data as a CSV file for your records.');
}

// Make functions available globally
window.showTab = showTab;
window.startRecording = startRecording;
window.stopRecording = stopRecording;
window.playRecording = playRecording;
window.deleteRecording = deleteRecording;
window.editMenuItem = editMenuItem;
window.toggleItemActive = toggleItemActive;
window.addNewMenuItem = addNewMenuItem;
window.addNewQA = addNewQA;
window.editQA = editQA;
window.deleteQA = deleteQA;
window.recordQA = recordQA;
window.playQARecording = playQARecording;
window.addNewEvent = addNewEvent;
window.regenerateMessage = regenerateMessage;
window.sendCampaign = sendCampaign;
window.saveAllChanges = saveAllChanges;
window.startInterview = startInterview;
window.recordAnswer = recordAnswer;
window.nextQuestion = nextQuestion;
window.skipQuestion = skipQuestion;
window.pauseInterview = pauseInterview;
window.reviewInterview = reviewInterview;
window.exportInterview = exportInterview;