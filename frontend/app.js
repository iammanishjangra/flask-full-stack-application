document.addEventListener('DOMContentLoaded', () => {
    const statusBadge = document.getElementById('status-badge');
    const messagesContainer = document.getElementById('messages-container');
    const messageForm = document.getElementById('message-form');
    const messageInput = document.getElementById('message-input');
    const submitBtn = document.getElementById('submit-btn');

    // API URL to directly point to backend running on localhost
    const API_BASE = 'http://localhost:5000/api';

    // 1. Check Backend Status
    async function checkStatus() {
        try {
            const res = await fetch(`${API_BASE}/status`);
            if (res.ok) {
                const data = await res.json();
                statusBadge.textContent = 'Backend Connected';
                statusBadge.classList.add('connected');
                statusBadge.classList.remove('error');
            } else {
                throw new Error('Backend responded with error');
            }
        } catch (error) {
            statusBadge.textContent = 'Backend Disconnected';
            statusBadge.classList.add('error');
            statusBadge.classList.remove('connected');
            console.error('Status check failed:', error);
        }
    }

    // 2. Fetch Messages
    async function fetchMessages() {
        try {
            const res = await fetch(`${API_BASE}/messages`);
            if (!res.ok) throw new Error('Failed to fetch messages');
            
            const messages = await res.json();
            renderMessages(messages);
            
        } catch (error) {
            console.error('Fetch messages failed:', error);
            messagesContainer.innerHTML = `<div class="empty-state">Unable to load messages. Is the database connected?</div>`;
        }
    }

    // 3. Render Messages in DOM
    function renderMessages(messages) {
        if (!messages || messages.length === 0) {
            messagesContainer.innerHTML = `<div class="empty-state">No messages yet. Be the first to say something!</div>`;
            return;
        }

        messagesContainer.innerHTML = '';
        messages.forEach(msg => {
            const card = document.createElement('div');
            card.className = 'message-card';
            
            const content = document.createElement('div');
            content.className = 'content';
            content.textContent = msg.content;
            
            const meta = document.createElement('div');
            meta.className = 'meta';
            const date = new Date(msg.created_at).toLocaleString();
            meta.textContent = `Posted on ${date} (ID: ${msg.id})`;
            
            card.appendChild(content);
            card.appendChild(meta);
            messagesContainer.appendChild(card);
        });
    }

    // 4. Submit New Message
    messageForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const content = messageInput.value.trim();
        if (!content) return;
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        try {
            const res = await fetch(`${API_BASE}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content })
            });
            
            if (res.ok) {
                messageInput.value = '';
                // Refetch instantly
                await fetchMessages();
            } else {
                alert("Failed to send message. Please try again.");
            }
        } catch (error) {
            console.error('Submit failed:', error);
            alert("Network error while sending message.");
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        }
    });

    // Initialization
    checkStatus();
    fetchMessages();
});
