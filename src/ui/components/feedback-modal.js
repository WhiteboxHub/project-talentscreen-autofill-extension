/**
 * Feedback Modal Component
 * Collects user feedback after autofill or from feedback button
 */

const FeedbackModal = {
  currentModal: null,
  sessionData: null,

  /**
   * Show feedback modal
   * @param {Object} sessionData - Current autofill session data (optional)
   */
  show(sessionData = null) {
    this.sessionData = sessionData;
    this.hide(); // Remove existing modal

    // Create modal HTML
    const modal = document.createElement('div');
    modal.className = 'feedback-modal-overlay';
    modal.innerHTML = `
      <div class="feedback-modal">
        <div class="feedback-header">
          <h2>Share Your Feedback</h2>
          <button class="feedback-close-btn" id="feedbackCloseBtn" aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <form id="feedbackForm" class="feedback-body">
          <!-- Rating Question -->
          <div class="feedback-section">
            <label class="feedback-label">
              How would you rate your overall experience with our Autofill Plugin?
              <span class="required">*</span>
            </label>
            <div class="rating-scale">
              <div class="rating-labels">
                <span class="rating-label-left">Not Satisfied</span>
                <span class="rating-label-right">Very Satisfied</span>
              </div>
              <div class="rating-options">
                ${Array.from({ length: 11 }, (_, i) => `
                  <label class="rating-option">
                    <input type="radio" name="rating" value="${i}" required>
                    <span class="rating-number">${i}</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Problems Checkboxes -->
          <div class="feedback-section">
            <label class="feedback-label">
              What aspects of the autofill experience did not meet your expectations?
            </label>
            <div class="feedback-checkboxes">
              <label class="feedback-checkbox">
                <input type="checkbox" name="problems" value="popup_appeared_incorrectly">
                <span>The pop-up appeared when it shouldn't have</span>
              </label>
              <label class="feedback-checkbox">
                <input type="checkbox" name="problems" value="not_enough_sites">
                <span>Not enough sites were supported</span>
              </label>
              <label class="feedback-checkbox">
                <input type="checkbox" name="problems" value="process_too_long">
                <span>The process took too long</span>
              </label>
              <label class="feedback-checkbox">
                <input type="checkbox" name="problems" value="fields_not_detected">
                <span>Some fields were not detected</span>
              </label>
              <label class="feedback-checkbox">
                <input type="checkbox" name="problems" value="fields_filled_incorrectly">
                <span>Fields were not filled correctly</span>
              </label>
              <label class="feedback-checkbox">
                <input type="checkbox" name="problems" value="other">
                <span>Other</span>
              </label>
            </div>
          </div>

          <!-- Free Text Feedback -->
          <div class="feedback-section">
            <label class="feedback-label" for="feedbackText">
              Any specific feedback on how we can improve for you?
            </label>
            <textarea
              id="feedbackText"
              name="feedback"
              rows="5"
              placeholder="Share your thoughts, suggestions, or report issues..."
              class="feedback-textarea"
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="feedback-actions">
            <button type="button" class="feedback-btn feedback-btn-cancel" id="feedbackCancelBtn">
              Cancel
            </button>
            <button type="submit" class="feedback-btn feedback-btn-submit">
              Submit Feedback
            </button>
          </div>
        </form>

        <div id="feedbackSuccess" class="feedback-success hidden">
          <svg class="feedback-success-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M9 12l2 2 4-4"></path>
          </svg>
          <h3>Thank You!</h3>
          <p>Your feedback has been received and will help us improve.</p>
          <button class="feedback-btn feedback-btn-submit" id="feedbackDoneBtn">
            Done
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
    this.currentModal = modal;

    // Event listeners
    this._attachEventListeners(modal);
  },

  /**
   * Attach event listeners to modal
   */
  _attachEventListeners(modal) {
    const closeBtn = modal.querySelector('#feedbackCloseBtn');
    const cancelBtn = modal.querySelector('#feedbackCancelBtn');
    const doneBtn = modal.querySelector('#feedbackDoneBtn');
    const form = modal.querySelector('#feedbackForm');
    const overlay = modal.querySelector('.feedback-modal-overlay');

    // Close handlers
    const handleClose = () => this.hide();
    closeBtn.addEventListener('click', handleClose);
    cancelBtn.addEventListener('click', handleClose);
    if (doneBtn) doneBtn.addEventListener('click', handleClose);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        handleClose();
      }
    });

    // Close on Escape key
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    document.addEventListener('keydown', handleEscape);

    // Form submission
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this._handleSubmit(form);
    });

    // Rating selection highlighting
    const ratingInputs = modal.querySelectorAll('input[name="rating"]');
    ratingInputs.forEach(input => {
      input.addEventListener('change', () => {
        ratingInputs.forEach(r => {
          r.closest('.rating-option').classList.remove('selected');
        });
        input.closest('.rating-option').classList.add('selected');
      });
    });
  },

  /**
   * Handle form submission
   */
  async _handleSubmit(form) {
    const formData = new FormData(form);

    // Collect rating
    const rating = formData.get('rating');

    // Collect problems
    const problems = [];
    formData.getAll('problems').forEach(problem => {
      problems.push(problem);
    });

    // Collect free text
    const feedbackText = formData.get('feedback');

    // Create feedback object
    const feedback = {
      id: this._generateId(),
      timestamp: new Date().toISOString(),
      rating: parseInt(rating),
      problems: problems,
      feedback: feedbackText,
      session: this.sessionData ? {
        url: this.sessionData.jobUrl,
        company: this.sessionData.companyName,
        atsType: this.sessionData.atsProvider,
        fieldsFound: this.sessionData.totalFieldsFound,
        fieldsFilled: this.sessionData.requiredFieldsFilled,
        completion: Math.round((this.sessionData.requiredFieldsFilled / this.sessionData.requiredFieldsFound) * 100)
      } : null,
      userAgent: navigator.userAgent,
      extensionVersion: chrome.runtime.getManifest?.()?.version || 'unknown'
    };

    // Save feedback
    await this._saveFeedback(feedback);

    // Show success message
    this._showSuccess();

    // Log for debugging
    console.log('[Feedback] Submitted:', feedback);
  },

  /**
   * Save feedback to storage and send email
   */
  async _saveFeedback(feedback) {
    // Send email notification
    await this._sendFeedbackEmail(feedback);

    // Also save locally
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['feedbackSubmissions'], (result) => {
          const submissions = result.feedbackSubmissions || [];
          submissions.push(feedback);

          // Keep only last 50 submissions
          if (submissions.length > 50) {
            submissions.splice(0, submissions.length - 50);
          }

          chrome.storage.local.set({ feedbackSubmissions: submissions }, resolve);
        });
      } else {
        resolve();
      }
    });
  },

  /**
   * Send feedback via email using mailto (opens user's email client)
   * Falls back to Web3Forms API for seamless submission
   */
  async _sendFeedbackEmail(feedback) {
    try {
      // Format email body
      const emailBody = this._formatEmailBody(feedback);

      // Use Web3Forms API for seamless email submission
      const formData = new FormData();
      formData.append('access_key', 'YOUR_WEB3FORMS_KEY'); // You'll need to get this from web3forms.com (free)
      formData.append('subject', `TalentScreen Feedback - Rating: ${feedback.rating}/10`);
      formData.append('from_name', 'TalentScreen Extension');
      formData.append('email', 'sampath.velupula@gmail.com,recruiting@whitebox-learning.com');
      formData.append('message', emailBody);

      // Send via Web3Forms (or similar service)
      // For now, we'll use a simple mailto fallback
      // You can integrate with Web3Forms, FormSpree, or EmailJS later

      console.log('[Feedback] Email data prepared:', {
        to: ['sampath.velupula@gmail.com', 'recruiting@whitebox-learning.com'],
        subject: `TalentScreen Feedback - Rating: ${feedback.rating}/10`,
        body: emailBody
      });

      // Fallback: Send to background script to handle email
      if (chrome.runtime) {
        chrome.runtime.sendMessage({
          action: 'send_feedback_email',
          feedback: feedback,
          emailBody: emailBody
        });
      }
    } catch (error) {
      console.error('[Feedback] Error sending email:', error);
      // Continue anyway - feedback is still saved locally
    }
  },

  /**
   * Format feedback as email body
   */
  _formatEmailBody(feedback) {
    const lines = [];

    lines.push('=== TALENTSCREEN FEEDBACK ===\n');
    lines.push(`Timestamp: ${new Date(feedback.timestamp).toLocaleString()}`);
    lines.push(`Rating: ${feedback.rating}/10\n`);

    if (feedback.problems && feedback.problems.length > 0) {
      lines.push('Problems Reported:');
      feedback.problems.forEach(problem => {
        lines.push(`  - ${problem.replace(/_/g, ' ')}`);
      });
      lines.push('');
    }

    if (feedback.feedback) {
      lines.push('User Feedback:');
      lines.push(feedback.feedback);
      lines.push('');
    }

    if (feedback.session) {
      lines.push('Session Details:');
      lines.push(`  Company: ${feedback.session.company}`);
      lines.push(`  URL: ${feedback.session.url}`);
      lines.push(`  ATS Type: ${feedback.session.atsType}`);
      lines.push(`  Fields Found: ${feedback.session.fieldsFound}`);
      lines.push(`  Fields Filled: ${feedback.session.fieldsFilled}`);
      lines.push(`  Completion: ${feedback.session.completion}%`);
      lines.push('');
    }

    lines.push('Technical Details:');
    lines.push(`  Extension Version: ${feedback.extensionVersion}`);
    lines.push(`  User Agent: ${feedback.userAgent}`);
    lines.push(`  Feedback ID: ${feedback.id}`);

    return lines.join('\n');
  },

  /**
   * Show success message
   */
  _showSuccess() {
    const form = this.currentModal.querySelector('#feedbackForm');
    const success = this.currentModal.querySelector('#feedbackSuccess');

    form.classList.add('hidden');
    success.classList.remove('hidden');
  },

  /**
   * Hide modal
   */
  hide() {
    if (this.currentModal) {
      this.currentModal.remove();
      this.currentModal = null;
    }
  },

  /**
   * Generate unique ID
   */
  _generateId() {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Export all feedback data
   */
  async exportFeedback() {
    return new Promise((resolve) => {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.get(['feedbackSubmissions'], (result) => {
          resolve(result.feedbackSubmissions || []);
        });
      } else {
        resolve([]);
      }
    });
  }
};

// Export for use in other scripts
if (typeof window !== 'undefined') {
  window.FeedbackModal = FeedbackModal;
}
