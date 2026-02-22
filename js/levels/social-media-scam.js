/**
 * Social Media Giveaway Scam Level
 * Difficulty: Medium
 */
export function build() {
  const container = document.createElement('div');
  container.className = 'level-container social-media-scam';
  
  // Define suspicious elements
  const suspiciousIds = [
    'fake-verified',
    'too-good-prize',
    'urgency-text',
    'payment-request',
    'suspicious-handle'
  ];

  container.innerHTML = `
    <div class="social-post">
      <div class="post-header">
        <div class="profile-pic"></div>
        <div class="profile-info">
          <div class="handle-row">
            <span class="handle" data-suspicious="suspicious-handle">@official_giveaway_rewards_2024</span>
            <span class="verified-badge" data-suspicious="fake-verified">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="#1DA1F2" d="M22.5 12.5c0-1.58-.8-3.04-2.12-3.88.13-.58.2-1.18.2-1.8 0-3.31-2.69-6-6-6-.62 0-1.22.07-1.8.2C11.94 2.8 10.48 2 8.9 2c-3.31 0-6 2.69-6 6 0 .62.07 1.22.2 1.8C1.8 10.68 1 12.14 1 13.72c0 1.58.8 3.04 2.12 3.88-.13.58-.2 1.18-.2 1.8 0 3.31 2.69 6 6 6 .62 0 1.22-.07 1.8-.2 1.14 1.32 2.6 2.12 4.18 2.12 3.31 0 6-2.69 6-6 0-.62-.07-1.22-.2-1.8 1.32-.84 2.12-2.3 2.12-3.88zM10 17l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </span>
          </div>
          <span class="location">Sponsored</span>
        </div>
        <div class="post-options">•••</div>
      </div>
      
      <div class="post-image">
        <div class="prize-banner" data-suspicious="too-good-prize">
          <h1>CONGRATULATIONS!</h1>
          <p>You've won an iPhone 15 Pro Max + $500 Gift Card!</p>
        </div>
      </div>
      
      <div class="post-actions">
        <div class="left-actions">
          <span class="icon">❤️</span>
          <span class="icon">💬</span>
          <span class="icon">✈️</span>
        </div>
        <span class="icon">🔖</span>
      </div>
      
      <div class="post-content">
        <p><strong>official_giveaway_rewards_2024</strong> <span data-suspicious="urgency-text">🚨 FINAL 2 HOURS TO CLAIM! 🚨</span></p>
        <p>We are giving away 50 iPhones to our lucky followers! To claim your prize, you just need to cover the small shipping and insurance fee of $19.99.</p>
        <div class="payment-box" data-suspicious="payment-request">
          <p>Send $19.99 to: <strong>giveaway-claims@fastpay.com</strong></p>
          <p class="note">Once sent, DM us the screenshot to receive your tracking number!</p>
        </div>
        <p class="hashtags">#giveaway #iphone #free #win #lucky</p>
      </div>
    </div>

    <style>
      .social-media-scam {
        display: flex;
        justify-content: center;
        padding: 20px;
        background: #fafafa;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      }
      .social-post {
        background: white;
        border: 1px solid #dbdbdb;
        max-width: 470px;
        width: 100%;
        border-radius: 8px;
      }
      .post-header {
        display: flex;
        align-items: center;
        padding: 12px;
        gap: 12px;
      }
      .profile-pic {
        width: 32px;
        height: 32px;
        background: #efefef;
        border-radius: 50%;
      }
      .profile-info {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .handle-row {
        display: flex;
        align-items: center;
        gap: 4px;
      }
      .handle {
        font-weight: 600;
        font-size: 14px;
      }
      .location {
        font-size: 12px;
        color: #8e8e8e;
      }
      .post-image {
        background: #262626;
        aspect-ratio: 1/1;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        text-align: center;
      }
      .prize-banner {
        padding: 20px;
        background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%);
        width: 100%;
      }
      .prize-banner h1 {
        font-size: 24px;
        margin: 0;
      }
      .post-actions {
        display: flex;
        justify-content: space-between;
        padding: 12px;
        font-size: 20px;
      }
      .left-actions {
        display: flex;
        gap: 16px;
      }
      .post-content {
        padding: 0 12px 12px;
        font-size: 14px;
        line-height: 1.5;
      }
      .payment-box {
        margin: 12px 0;
        padding: 12px;
        background: #f8f9fa;
        border: 1px dashed #dc3545;
        border-radius: 6px;
      }
      .payment-box p {
        margin: 4px 0;
      }
      .note {
        font-size: 12px;
        color: #6c757d;
      }
      .hashtags {
        color: #00376b;
        margin-top: 8px;
      }
      
      /* Game State Styles */
      [data-suspicious] {
        cursor: pointer;
        transition: background 0.2s;
      }
      [data-suspicious].selected {
        background: rgba(255, 255, 0, 0.3);
        outline: 2px solid yellow;
      }
    </style>
  `;

  // Add click listeners for toggling selection
  container.querySelectorAll('[data-suspicious]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      el.classList.toggle('selected');
    });
  });

  return {
    element: container,
    suspiciousIds
  };
}
