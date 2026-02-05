    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-Y1X3LN2FSB');
    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'index.html';
      }
    }

    // Loyalty Modal Functions
    function openLoyaltySignup(businessId, showCoupon = true) {
      const couponSection = document.getElementById('coupon-section');
      if (showCoupon) {
        couponSection.style.display = 'block';
      } else {
        couponSection.style.display = 'none';
      }
      document.getElementById('loyalty-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }

    function closeLoyaltyModal() {
      document.getElementById('loyalty-modal').style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    // Request Service Modal Functions
    let currentRequestBusinessId = null;

    function openRequestServiceModal(businessId) {
      currentRequestBusinessId = businessId;
      document.getElementById('request-service-modal').style.display = 'flex';
      document.body.style.overflow = 'hidden';

      // Set minimum date to today
      const today = new Date().toISOString().split('T')[0];
      document.getElementById('service-date').min = today;
    }

    function closeRequestServiceModal() {
      document.getElementById('request-service-modal').style.display = 'none';
      document.body.style.overflow = 'auto';

      // Reset form
      document.getElementById('request-service-form').reset();
      document.getElementById('request-service-form').style.display = 'block';
      document.getElementById('request-success').style.display = 'none';
    }

    // Handle request service form submission
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('request-service-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();

          // Get form data
          const formData = new FormData(form);
          const leadData = {
            serviceType: formData.get('serviceType'),
            requestedDate: formData.get('requestedDate'),
            requestedTime: formData.get('requestedTime'),
            flexible: formData.get('flexible') === 'on',
            partySize: formData.get('partySize') || null,
            budget: formData.get('budget') || null,
            description: formData.get('description'),
            touristName: formData.get('touristName'),
            touristPhone: formData.get('touristPhone'),
            touristEmail: formData.get('touristEmail') || null
          };

          // Determine category and target based on service type
          const serviceTypeToCategory = {
            'photographer': 'photographers',
            'catering': 'restaurants',
            'boat-rental': 'activities',
            'event-planning': 'activities',
            'equipment-rental': 'activities',
            'tour-guide': 'activities',
            'fishing-charter': 'activities',
            'other': 'restaurants' // Default
          };

          leadData.category = serviceTypeToCategory[leadData.serviceType] || 'restaurants';
          leadData.targetCategory = leadData.category;

          // If on a specific business profile, target that business
          if (currentRequestBusinessId) {
            leadData.targetBusinessIds = [currentRequestBusinessId];
          }

          // Create lead
          if (typeof leadManager !== 'undefined') {
            const lead = leadManager.createLead(leadData);

            // Show success message
            form.style.display = 'none';
            document.getElementById('request-success').style.display = 'block';

            console.log('Lead created successfully:', lead.id);
          } else {
            alert('Lead manager not available. Please try again.');
          }
        });
      }
    });

    // Coupon Section Scroll Behavior
    let lastScrollTop = 0;
    const handleCouponScroll = () => {
      const loyaltyModal = document.getElementById('loyalty-modal');
      const loyaltyBody = loyaltyModal?.querySelector('.loyalty-body');
      const couponSection = loyaltyModal?.querySelector('.coupon-offer-section');

      if (!loyaltyBody || !couponSection) return;

      const scrollTop = loyaltyBody.scrollTop;

      if (scrollTop > lastScrollTop && scrollTop > 50) {
        // Scrolling down
        couponSection.classList.add('hidden');
      } else if (scrollTop < lastScrollTop) {
        // Scrolling up
        couponSection.classList.remove('hidden');
      }

      lastScrollTop = scrollTop;
    };

    // Attach scroll listener when modal opens
    document.addEventListener('DOMContentLoaded', () => {
      const loyaltyModal = document.getElementById('loyalty-modal');
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.attributeName === 'style') {
            const loyaltyBody = loyaltyModal?.querySelector('.loyalty-body');
            if (loyaltyModal.style.display === 'flex' && loyaltyBody) {
              loyaltyBody.addEventListener('scroll', handleCouponScroll);
            } else {
              loyaltyBody?.removeEventListener('scroll', handleCouponScroll);
              lastScrollTop = 0;
              // Reset coupon visibility when closing
              const couponSection = loyaltyModal?.querySelector('.coupon-offer-section');
              couponSection?.classList.remove('hidden');
            }
          }
        });
      });

      if (loyaltyModal) {
        observer.observe(loyaltyModal, { attributes: true });
      }
    });

    // Date Selector Functions
    let selectedArrivalDate = null;
    let selectedDepartureDate = null;

    function openDateSelector() {
      document.getElementById('date-selector-modal').style.display = 'flex';
    }

    function closeDateSelector() {
      document.getElementById('date-selector-modal').style.display = 'none';
    }

    function confirmDates() {
      const arrivalInput = document.getElementById('arrival-date');
      const departureInput = document.getElementById('departure-date');

      selectedArrivalDate = arrivalInput.value;
      selectedDepartureDate = departureInput.value;

      if (selectedArrivalDate && selectedDepartureDate) {
        const arrivalDate = new Date(selectedArrivalDate);
        const departureDate = new Date(selectedDepartureDate);

        if (departureDate <= arrivalDate) {
          alert('Departure date must be after arrival date');
          return;
        }

        const displayText = `${arrivalDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} - ${departureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
        document.getElementById('selected-dates-display').innerHTML = `<div class="selected-dates-text">✓ ${displayText}</div>`;
        closeDateSelector();
      } else {
        alert('Please select both arrival and departure dates');
      }
    }

    // Handle loyalty form submission
    document.addEventListener('DOMContentLoaded', () => {
      const loyaltyForm = document.getElementById('loyalty-form');
      if (loyaltyForm) {
        loyaltyForm.addEventListener('submit', (e) => {
          e.preventDefault();

          // Get all interest checkboxes
          const interests = [];
          document.querySelectorAll('[name^="interest-"]').forEach(checkbox => {
            if (checkbox.checked) interests.push(checkbox.value);
          });

          // Get visitor type
          const visitorType = document.querySelector('input[name="visitor-type"]:checked')?.value || '';
          const firstTime = document.querySelector('input[name="first-time"]:checked')?.value || '';

          // Get business ID and name from URL and data
          const businessId = new URLSearchParams(window.location.search).get('id') || 'unknown';
          const business = allBusinesses.find(b => b.id === businessId);
          const businessName = business ? business.name : 'Unknown Business';

          const formData = {
            name: document.getElementById('loyalty-name').value,
            phone: document.getElementById('loyalty-phone').value,
            email: document.getElementById('loyalty-email').value,
            state: document.getElementById('loyalty-state').value,
            firstTime: firstTime,
            visitorType: visitorType,
            arrivalDate: selectedArrivalDate,
            departureDate: selectedDepartureDate,
            interests: interests,
            smsOptIn: document.getElementById('sms-opt-in').checked,
            businessId: businessId,
            businessName: businessName,
            pageUrl: window.location.href,
            timestamp: new Date().toISOString()
          };

          // Send to Google Sheets
          const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyylYiOpPA4jv3sfsu5yI-Fej0wA-vefVPIZGfKuGFrWn9RWQq-0v_EpK8ybZTe682bQw/exec';

          fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
          })
          .then(() => {
            // Track loyalty signup in Google Analytics
            if (typeof gtag === 'function') {
              gtag('event', 'loyalty_signup', {
                business_id: businessId,
                business_name: businessName,
                visitor_type: visitorType,
                first_time: firstTime,
                sms_opt_in: formData.smsOptIn,
                event_category: 'Engagement',
                event_label: 'Loyalty Program Signup'
              });
            }

            // Show success message
            alert('Thank you for signing up! You will receive exclusive deals and offers via text message.');
            closeLoyaltyModal();
            loyaltyForm.reset();
            document.getElementById('selected-dates-display').innerHTML = '';
            selectedArrivalDate = null;
            selectedDepartureDate = null;
          })
          .catch(error => {
            console.error('Signup error:', error);
            // Still show success to user (data is likely saved despite CORS)
            alert('Thank you for signing up! You will receive exclusive deals and offers via text message.');
            closeLoyaltyModal();
            loyaltyForm.reset();
            document.getElementById('selected-dates-display').innerHTML = '';
            selectedArrivalDate = null;
            selectedDepartureDate = null;
          });
        });
      }
    });

    // Close modal when clicking outside
    document.addEventListener('click', (e) => {
      const loyaltyModal = document.getElementById('loyalty-modal');
      const dateSelectorModal = document.getElementById('date-selector-modal');
      if (e.target === loyaltyModal) {
        closeLoyaltyModal();
      }
      if (e.target === dateSelectorModal) {
        closeDateSelector();
      }
    });

    // === Business AI Concierge Functions ===

    // Initialize AI widget if business has AI enabled
    document.addEventListener('DOMContentLoaded', () => {
      const urlParams = new URLSearchParams(window.location.search);
      const businessId = urlParams.get('id');

      if (businessId && typeof hasAIEnabled === 'function' && hasAIEnabled(businessId)) {
        // Show AI widget
        document.getElementById('business-ai-widget').style.display = 'block';

        // Set business name in AI header
        if (typeof getBusinessAIConfig === 'function') {
          const config = getBusinessAIConfig(businessId);
          if (config) {
            document.getElementById('ai-business-name').textContent = config.aiPersonality.name || config.name;

            // Add welcome message
            setTimeout(() => {
              addAIMessage(config.aiPersonality.greeting, 'assistant');
            }, 500);
          }
        }
      }
    });

    // Toggle AI chat open/close
    function toggleBusinessAI() {
      const chat = document.getElementById('business-ai-chat');
      const isOpen = chat.style.display === 'flex';

      if (isOpen) {
        closeBusinessAI();
      } else {
        openBusinessAI();
      }
    }

    // Open AI chat
    function openBusinessAI() {
      const chat = document.getElementById('business-ai-chat');
      const button = document.getElementById('business-ai-toggle');

      chat.style.display = 'flex';
      button.classList.add('ai-open');

      // Track AI widget opened
      if (typeof gtag === 'function') {
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('id');
        gtag('event', 'business_ai_opened', {
          business_id: businessId,
          event_category: 'AI',
          event_label: 'Business Concierge Opened'
        });
      }

      // Focus input
      document.getElementById('business-ai-input').focus();
    }

    // Close AI chat
    function closeBusinessAI() {
      const chat = document.getElementById('business-ai-chat');
      const button = document.getElementById('business-ai-toggle');

      chat.style.display = 'none';
      button.classList.remove('ai-open');
    }

    // Send message from input
    async function sendBusinessAIMessage() {
      const input = document.getElementById('business-ai-input');
      const message = input.value.trim();

      if (!message) return;

      // Clear input
      input.value = '';

      // Add user message
      addAIMessage(message, 'user');

      // Get AI response
      await getAIResponse(message);
    }

    // Handle Enter key in input
    function handleBusinessAIEnter(event) {
      if (event.key === 'Enter') {
        sendBusinessAIMessage();
      }
    }

    // Quick action button clicked
    async function askBusinessAI(question) {
      // Add user message
      addAIMessage(question, 'user');

      // Get AI response
      await getAIResponse(question);
    }

    // Get AI response from business concierge
    async function getAIResponse(userMessage) {
      // Show typing indicator
      const typingId = addAIMessage('...', 'assistant', true);

      // Track AI interaction in Google Analytics
      if (typeof gtag === 'function') {
        const urlParams = new URLSearchParams(window.location.search);
        const businessId = urlParams.get('id');
        gtag('event', 'business_ai_question', {
          business_id: businessId,
          question_length: userMessage.length,
          event_category: 'AI',
          event_label: 'Business Concierge Question'
        });
      }

      try {
        // Use Gemini-powered businessAI if available
        if (typeof window.businessAI !== 'undefined' && window.businessAI.isConfigured()) {
          const response = await window.businessAI.sendMessage(userMessage);

          // Remove typing indicator
          removeAIMessage(typingId);

          // Add AI response
          addAIMessage(response, 'assistant');
        } else if (typeof window.businessConcierge !== 'undefined') {
          // Fallback to old business concierge
          const response = await window.businessConcierge.processUserInput(userMessage);

          // Remove typing indicator
          removeAIMessage(typingId);

          // Add AI response
          addAIMessage(response, 'assistant');

          // Track successful response
          if (typeof gtag === 'function') {
            gtag('event', 'business_ai_response', {
              response_length: response.length,
              event_category: 'AI',
              event_label: 'Business Concierge Response'
            });
          }
        } else {
          // Fallback
          removeAIMessage(typingId);
          addAIMessage('I\'m sorry, the AI assistant is not available right now. Please try again later.', 'assistant');
        }
      } catch (error) {
        console.error('AI error:', error);
        removeAIMessage(typingId);
        addAIMessage('I\'m having trouble responding right now. Please try again.', 'assistant');

        // Track error
        if (typeof gtag === 'function') {
          gtag('event', 'business_ai_error', {
            error_message: error.message,
            event_category: 'AI',
            event_label: 'Business Concierge Error'
          });
        }
      }
    }

    // Add message to chat
    function addAIMessage(text, role, isTyping = false) {
      const messagesContainer = document.getElementById('business-ai-messages');
      const messageDiv = document.createElement('div');
      const messageId = 'ai-msg-' + Date.now();

      messageDiv.id = messageId;
      messageDiv.className = `ai-message ai-message-${role}`;

      if (isTyping) {
        messageDiv.classList.add('ai-typing');
      }

      // Format message (convert markdown-style bold to HTML)
      const formattedText = text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n/g, '<br>');

      messageDiv.innerHTML = `<div class="ai-message-content">${formattedText}</div>`;

      messagesContainer.appendChild(messageDiv);

      // Scroll to bottom
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      return messageId;
    }

    // Remove message from chat
    function removeAIMessage(messageId) {
      const message = document.getElementById(messageId);
      if (message) {
        message.remove();
      }
    }
    // Initialize YELLOW business voice AI AFTER profile loads
    window.addEventListener('profileLoaded', (event) => {
      const business = event.detail.business || window.currentBusiness;

      if (!business) {
        console.error('❌ No business data for AI');
        return;
      }

      // Get current business data - flatten menu if nested
      let menuItems = [];
      if (Array.isArray(business.menu)) {
        menuItems = business.menu;
      } else if (business.menu && typeof business.menu === 'object') {
        // Flatten nested menu structure for AI
        Object.keys(business.menu).forEach(mealPeriod => {
          const meal = business.menu[mealPeriod];
          if (meal.sections) {
            Object.values(meal.sections).forEach(section => {
              if (section.items) {
                menuItems.push(...section.items);
              }
            });
          }
        });
      }

      const businessData = {
        name: business.name || business.business_name,
        address: business.address,
        hours: business.hours,
        menu: menuItems,
        drinks: business.drinks || [],
        happyHours: business.happyHours || [],
        specials: business.specials || [],
        events: business.events || [],
        photos: business.photos || [],
        faqs: business.faqs || [],
        aiContext: business.aiContext || business.ai_context || ''
      };

      // Create YELLOW voice AI for this business
      window.profileAI = new ProfileBusinessAI(businessData);
      console.log('✅ YELLOW voice AI loaded for:', businessData.name);

      // Initialize Gemini-powered Business AI
      if (window.businessAI) {
        window.businessAI.initForBusiness(business);
        console.log('✅ Gemini Business AI initialized for:', business.name);

        // Update AI widget with business name
        const aiBusinessName = document.getElementById('ai-business-name');
        if (aiBusinessName) {
          aiBusinessName.textContent = `${business.name} Assistant`;
        }

        // Update quick actions with suggested questions
        const quickActions = document.getElementById('business-ai-quick-actions');
        if (quickActions) {
          const suggestions = window.businessAI.getSuggestedQuestions();
          if (suggestions.length > 0) {
            quickActions.innerHTML = suggestions.slice(0, 4).map(q =>
              `<button class="quick-action-btn" onclick="askBusinessAI('${q.replace(/'/g, "\\'")}')">${q}</button>`
            ).join('');
          }
        }
      }
    });

    // Helper function: open AI chat from button
    function openBusinessAIChat() {
      openBusinessAI();
    }
