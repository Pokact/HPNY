// JavaScript để xử lý sự kiện form liên hệ
document.addEventListener('DOMContentLoaded', function() {
  setupContactForm();
  setupGalleryLightbox();
  setupLazyLoading();
});

function setupLazyLoading() {
  // Áp dụng lazy loading cho tất cả hình ảnh
  const images = document.querySelectorAll('img[src]');
  
  if ('loading' in HTMLImageElement.prototype) {
    // Trình duyệt hỗ trợ lazy loading
    images.forEach(img => {
      img.loading = 'lazy';
    });
  } else {
    // Fallback cho trình duyệt không hỗ trợ
    // Sử dụng Intersection Observer API
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          const src = img.getAttribute('data-src');
          if (src) {
            img.src = src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => {
      if (!img.loading) {
        const src = img.src;
        img.setAttribute('data-src', src);
        img.src = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='; // Placeholder
        imageObserver.observe(img);
      }
    });
  }
}

function setupGalleryLightbox() {
  // Thêm hiệu ứng lightbox khi click vào ảnh
  const galleryImages = document.querySelectorAll('.gallery-image img, .activity-gallery img');

  if (galleryImages.length > 0) {
    // Tạo lightbox elements
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    
    const lightboxContent = document.createElement('div');
    lightboxContent.className = 'lightbox-content';
    
    const lightboxImage = document.createElement('img');
    lightboxContent.appendChild(lightboxImage);
    
    const lightboxClose = document.createElement('span');
    lightboxClose.className = 'lightbox-close';
    lightboxClose.innerHTML = '&times;';
    
    const lightboxCaption = document.createElement('div');
    lightboxCaption.className = 'lightbox-caption';
    
    lightbox.appendChild(lightboxContent);
    lightbox.appendChild(lightboxClose);
    lightbox.appendChild(lightboxCaption);
    document.body.appendChild(lightbox);
    
    // Hàm mở lightbox
    window.openLightbox = function(src, caption) {
      lightboxImage.src = src;
      lightboxCaption.textContent = caption || '';
      lightbox.classList.add('active');
    };
    
    // Thêm sự kiện click cho mỗi ảnh
    galleryImages.forEach(img => {
      img.addEventListener('click', function() {
        let caption = '';
        // Lấy caption từ element gần nhất
        const captionElement = this.closest('.gallery-item')?.querySelector('.gallery-caption p');
        if (captionElement) {
          caption = captionElement.textContent;
        } else {
          caption = this.alt || '';
        }
        
        openLightbox(this.src, caption);
      });
    });
    
    // Đóng lightbox khi click vào nút đóng hoặc vùng tối
    lightboxClose.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });
    
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });
  }
}

function setupContactForm() {
  const contactForm = document.querySelector('.contact-form');

  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();

      // Lấy dữ liệu từ form
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const message = document.getElementById('message').value.trim();

      // Kiểm tra dữ liệu
      if (!name || !email || !message) {
        alert('Vui lòng điền đầy đủ thông tin');
        return;
      }

      // Chuẩn bị dữ liệu để gửi
      const messageData = {
        name: name,
        email: email,
        message: message
      };

      console.log('Đang gửi tin nhắn:', messageData);

      // Đảm bảo URL khớp với endpoint trong server.js
      const apiUrl = window.location.origin + '/api/messages';
      console.log('Gửi đến URL:', apiUrl);

      fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messageData)
      })
      .then(response => {
        console.log('Nhận phản hồi:', response.status, response.statusText);
        return response.json();
      })
      .then(data => {
        console.log('Dữ liệu nhận được:', data);
        if (data.success) {
          alert('Tin nhắn của bạn đã được gửi thành công!');
          contactForm.reset();
        } else {
          alert('Có lỗi xảy ra: ' + (data.error || 'Không thể gửi tin nhắn'));
        }
      })
      .catch(error => {
        console.error('Lỗi khi gửi tin nhắn:', error);
        alert('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
      });
    });
  }
}