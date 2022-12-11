const asciiBrightness = ' .:-=+*#%@';

const main = document.querySelector('main');
const canvas = document.createElement('canvas');
const context = canvas.getContext('2d');
const video = document.createElement('video');
video.width = 128;
video.height = 128;

const getPixels = (img) => {
  context.clearRect(0, 0, img.width, img.height);
  context.drawImage(img, 0, 0, img.width, img.height);

  return context.getImageData(0, 0, img.width, img.height).data;
}

const getPixelsGrayScale = (img) => {
  const pixels = getPixels(img);
  const grayScalePixels = [];

  for (let i = 0; i < img.height; i++) {
    for (let j = 0; j < img.width; j++) {
      const startIndex = (i * img.width + j) * 4;
      const r = pixels[startIndex];
      const g = pixels[startIndex + 1];
      const b = pixels[startIndex + 2];
      const a = pixels[startIndex + 3];

      const grayScale = Math.floor((r + g + b) / 3);
      grayScalePixels.push(grayScale);
    }
  }

  return grayScalePixels;
};

const mapRange = (value, x1, y1, x2, y2) => {
  return (value - x1) * (y2 - x2) / (y1 - x1) + x2;
};

const encodeHtmlEntities = (str) => {
  return str.replace(/[\u00A0-\u9999<>\&]/g, function(i) {
    return '&#'+i.charCodeAt(0)+';';
  });
};

const calculateFontSize = () => {
  if (window.innerHeight > window.innerWidth) {
    return window.innerWidth / video.width * 1.70;
  } else {
    return window.innerHeight / video.height * 1.4;
  }
}

const drawVideo = (video) => {
  const pixels = getPixelsGrayScale(video);
  
  let text = '';

  for (let i = 0; i < pixels.length; i++) {
    const pixel = pixels[i];
    const charIndex = Math.floor(mapRange(pixel, 0, 255, 0, asciiBrightness.length - 1));
    let char = asciiBrightness[charIndex];
    char = encodeHtmlEntities(char);

    if (char === ' ') {
      char = '&nbsp';
    }

    text += char;

    if (i === 0) {
      continue;
    }

    if (i % video.width === 0) {
      text += '<br />';
    }
  }

  const fontSize = calculateFontSize();
  main.style.fontSize = `${fontSize}px`;
  main.style.lineHeight = `${fontSize * .7}px`;
  main.innerHTML = text;
};


const render = (video) => {
  drawVideo(video);

  setTimeout(() => {
    requestAnimationFrame(() => render(video));
    alert('still drawing');
  }, 1000 / 15);
};

const setupHud = () => {
  const resButtons = document.querySelectorAll('.res-control');
  
  resButtons.forEach(b => {
    if (parseInt(b.dataset.res) === video.height) {
      b.classList.add('active');
    }

    b.addEventListener('click', () => {
      video.width = b.dataset.res;
      video.height = b.dataset.res;

      resButtons.forEach(otherB => {
        otherB.classList.remove('active');
      });

      b.classList.add('active');
    });
  });
};

const start = () => {
  if (! navigator.mediaDevices.getUserMedia) {
    alert('Your browser is does not support camera access.');
    return;
  }

  navigator.mediaDevices.getUserMedia({
      video: true,
      video: { facingMode: 'user' },
    })
    .then(stream =>  {
      video.srcObject = stream;
    })
    .catch(e => {
      if (e.name === 'NotAllowedError') {
        alert('We have no permission to access your camera, you can change this in your browser settings.');
        return;
      }

      console.error(e);
    });
  
  video.addEventListener('loadeddata', () => {
    setupHud();
    video.play();
    render(video);
  });
}

document.getElementById('start').addEventListener('click', () => {
  const loader = document.createElement('div');
  loader.classList.add('loader');
  const loaderContainer = document.createElement('div');
  loaderContainer.classList.add('loader-container');
  loaderContainer.appendChild(loader);

  main.replaceChildren(loaderContainer);

  start();
});
