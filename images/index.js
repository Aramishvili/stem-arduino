   // ? FIXME: Enhanced smooth scrolling with offset TODO:
      document.addEventListener('DOMContentLoaded', function () {
        const navLinks = document.querySelectorAll('nav a[href^="#"]');

        navLinks.forEach((link) => {
          link.addEventListener('click', function (e) {
            e.preventDefault();
// ! TODO: Adjust offset for fixed header height
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
              const offsetTop = targetElement.offsetTop - 20; // 20px offset

              window.scrollTo({
                top: offsetTop,
                behavior: 'smooth',
              });
            }
          });
        });
      });
