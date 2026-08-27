(function () {
  const params = new URLSearchParams(window.location.search);
  const name = params.get('name') || 'Untitled app';
  const price = params.get('price') || '0';

  document.getElementById('product-name').textContent = name;
  document.getElementById('field-product').value = name;
  document.getElementById('field-price').value = price;

  const tabsEl = document.getElementById('payment-tabs');
  const detailEl = document.getElementById('payment-detail');
  const noteEl = document.getElementById('payment-note');
  const methodField = document.getElementById('field-method');
  const form = document.getElementById('order-form');
  const successState = document.getElementById('success-state');

  fetch('data/payment.json', { cache: 'no-store' })
    .then((res) => res.json())
    .then((data) => {
      document.getElementById('product-price').textContent =
        (data.currency || '৳') + price;
      noteEl.textContent = data.note || '';

      let active = 0;
      function renderDetail(i) {
        const m = data.methods[i];
        methodField.value = m.name;
        detailEl.innerHTML = `
          <div class="pay-number-row">
            <span class="pay-number">${m.number}</span>
            <button type="button" class="copy-btn" data-copy="${m.number}">Copy</button>
          </div>
          <p class="pay-instructions">${m.instructions}</p>
        `;
        detailEl.querySelector('.copy-btn').addEventListener('click', (e) => {
          navigator.clipboard.writeText(m.number).then(() => {
            e.target.textContent = 'Copied!';
            setTimeout(() => (e.target.textContent = 'Copy'), 1500);
          });
        });
      }

      data.methods.forEach((m, i) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'filter-btn pay-tab' + (i === 0 ? ' active' : '');
        btn.textContent = m.name;
        btn.addEventListener('click', () => {
          tabsEl.querySelectorAll('.pay-tab').forEach((b) => b.classList.remove('active'));
          btn.classList.add('active');
          renderDetail(i);
        });
        tabsEl.appendChild(btn);
      });

      renderDetail(active);
    })
    .catch(() => {
      noteEl.textContent = 'পেমেন্ট তথ্য লোড করা যায়নি। data/payment.json দেখুন।';
    });

  function encode(formData) {
    return new URLSearchParams(formData).toString();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    fetch('/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: encode(formData),
    })
      .then(() => {
        form.hidden = true;
        document.getElementById('payment-tabs').hidden = true;
        document.getElementById('payment-detail').hidden = true;
        noteEl.hidden = true;
        successState.hidden = false;
      })
      .catch(() => {
        alert('জমা দিতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করুন।');
      });
  });
})();
