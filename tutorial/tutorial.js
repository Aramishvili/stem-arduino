const steps = document.querySelectorAll('.step');
const progressBar = document.getElementById('progress-bar');
const nextBtn = document.getElementById('nextBtn');
let currentStep = 0;

nextBtn.addEventListener('click', () => {
  steps[currentStep].classList.remove('active');
  currentStep++;
  if (currentStep < steps.length) {
    steps[currentStep].classList.add('active');
    progressBar.style.width = (currentStep / (steps.length - 1)) * 100 + '%';
  }
  if (currentStep === steps.length - 1) {
    nextBtn.style.display = 'none'; // hide button at the end
  }
});
