const IMAGE_FOLDER = "images";
const IMAGE_EXTENSION = "webp";

/*
  STORY ORDER
  01-08  = Section 1: Kakashi introduction
  47-62  = Section 2: new 16-panel Kakashi/Obito story
  37-46  = Section 3: Might Guy + Kakashi
  27-35  = Section 4: Obito + Rin memory
  63-71 = Final rescue sequence
*/

const HERO_START = 1, HERO_END = 8;
const COMBAT_START = 47, COMBAT_END = 62;
const GUY_START = 37, GUY_END = 46;
const MEMORY_START = 27, MEMORY_END = 35;

const STORY_IMAGES = [
  ...Array.from({length: 8}, (_, i) => i + 1),
  ...Array.from({length: 9}, (_, i) => i + 27),
  ...Array.from({length: 35}, (_, i) => i + 37)
];

const FINAL_START = 63, FINAL_END = 71;

const heroCanvas = document.getElementById("heroCanvas");
const heroCtx = heroCanvas.getContext("2d");

const combatCanvas = document.getElementById("combatCanvas");
const combatCtx = combatCanvas.getContext("2d");

const guyCanvas = document.getElementById("guyCanvas");
const guyCtx = guyCanvas ? guyCanvas.getContext("2d") : null;

const memoryCanvas = document.getElementById("memoryCanvas");
const memoryCtx = memoryCanvas ? memoryCanvas.getContext("2d") : null;
const finalCanvas = document.getElementById("finalCanvas");
const finalCtx = finalCanvas ? finalCanvas.getContext("2d") : null;
const finalSection = document.getElementById("final");
const finalProgress = document.getElementById("finalProgress");
const finalFade = document.querySelector(".final-fade");

const loader = document.getElementById("loader");
const loaderProgress = document.getElementById("loaderProgress");
const loaderPercent = document.getElementById("loaderPercent");

const hero = document.getElementById("hero");
const combat = document.getElementById("combat");
const guy = document.getElementById("guy");
const memory = document.getElementById("memory");

const heroCopy = document.getElementById("heroCopy");
const phaseJP = document.getElementById("phaseJP");
const phaseEN = document.getElementById("phaseEN");
const scrollPercent = document.getElementById("scrollPercent");

const combatProgress = document.getElementById("combatProgress");

const guyProgress = document.getElementById("guyProgress");
const guyCaption = document.getElementById("guyCaption");
const guySmall = document.getElementById("guySmall");
const guyHeading = document.getElementById("guyHeading");
const guyDescription = document.getElementById("guyDescription");

const memoryProgress = document.getElementById("memoryProgress");
const memoryCaption = document.getElementById("memoryCaption");
const memorySmall = document.getElementById("memorySmall");
const memoryHeading = document.getElementById("memoryHeading");
const memoryDescription = document.getElementById("memoryDescription");

const images = {};

let heroFrame = 0, targetHeroFrame = 0;
let combatFrame = 0, targetCombatFrame = 0;
let guyFrame = 0, targetGuyFrame = 0;
let memoryFrame = 0, targetMemoryFrame = 0;
let finalFrame = 0, targetFinalFrame = 0;

let mouseX = 0.5;
let mouseY = 0.5;

const heroPhases = [
  {start:0, jp:"写輪眼", en:"The Copy Ninja"},
  {start:.2, jp:"忍", en:"Shinobi"},
  {start:.4, jp:"雷切", en:"Lightning Blade"},
  {start:.6, jp:"暗部", en:"ANBU"},
  {start:.8, jp:"雨", en:"Rain of Memories"}
];

const guyPhases = [
  {
    start:0,
    small:"Different paths",
    heading:"Same Fire",
    description:"Two very different shinobi. One friendship that never stopped moving forward."
  },
  {
    start:.16,
    small:"The rivalry",
    heading:"Keep Up",
    description:"Guy and Kakashi turn every challenge into another reason to push harder."
  },
  {
    start:.32,
    small:"The famous run",
    heading:"Side By Side",
    description:"The race begins. Neither wants to fall behind, and neither wants to run alone."
  },
  {
    start:.50,
    small:"No finish line",
    heading:"Keep Moving",
    description:"Years pass, but their friendly competition keeps giving them another step to take."
  },
  {
    start:.68,
    small:"More than rivals",
    heading:"A True Friend",
    description:"Behind every challenge is respect—the kind that stays when the race is over."
  },
  {
    start:.84,
    small:"Always forward",
    heading:"Together",
    description:"Different methods. Same village. The road is better when someone runs beside you."
  },
  {
    start:.95,
    small:"Some bonds endure",
    heading:"Always",
    description:"Rivals by choice. Friends by heart."
  }
];

const memoryPhases = [
  {
    start:0,
    small:"A distant memory",
    heading:"Still Waiting",
    description:"Obito and Rin run toward Kakashi through the fading light."
  },
  {
    start:.18,
    small:"They come closer",
    heading:"I'm Here",
    description:"Two familiar voices break through the silence as the distance disappears."
  },
  {
    start:.36,
    small:"Almost there",
    heading:"Don't Look Away",
    description:"Kakashi remains still. The memories are close enough to touch."
  },
  {
    start:.52,
    small:"The reunion",
    heading:"Old Friends",
    description:"Their hands finally reach him. For a moment, the years between them disappear."
  },
  {
    start:.68,
    small:"The mask cannot hide it",
    heading:"Kakashi",
    description:"The memories become real in his eyes. The grief he carried begins to surface."
  },
  {
    start:.82,
    small:"One last moment",
    heading:"Tears",
    description:"A tear rolls down his face as the people he lost stand beside him again."
  },
  {
    start:.94,
    small:"Some bonds never fade",
    heading:"Always Together",
    description:"Even after everything, they remain part of Kakashi's heart."
  }
];

function preloadImages(){
  return new Promise(resolve => {
    let loaded = 0;
    const total = STORY_IMAGES.length;

    for(const number of STORY_IMAGES){
      const img = new Image();

      const done = () => {
        loaded++;
        const pct = Math.round((loaded / total) * 100);
        if(loaderProgress) loaderProgress.style.width = pct + "%";
        if(loaderPercent) loaderPercent.textContent = pct + "%";
        if(loaded === total) resolve();
      };

      img.onload = done;
      img.onerror = () => {
        console.error("Could not load:", img.src);
        done();
      };

      img.src = `${IMAGE_FOLDER}/${String(number).padStart(2,"0")}.${IMAGE_EXTENSION}`;
      images[number] = img;
    }
  });
}

function resizeCanvas(canvas, ctx){
  if(!canvas || !ctx) return;

  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = window.innerWidth * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function drawCover(ctx, img, ox = 0, oy = 0){
  if(!ctx || !img || !img.complete || !img.naturalWidth) return;

  const w = window.innerWidth;
  const h = window.innerHeight;

  const imageRatio = img.naturalWidth / img.naturalHeight;
  const screenRatio = w / h;

  let drawWidth;
  let drawHeight;

  if(imageRatio > screenRatio){
    drawHeight = h;
    drawWidth = h * imageRatio;
  }else{
    drawWidth = w;
    drawHeight = w / imageRatio;
  }

  ctx.drawImage(
    img,
    (w - drawWidth) / 2 + ox,
    (h - drawHeight) / 2 + oy,
    drawWidth,
    drawHeight
  );
}

function drawFrame(ctx, frame, start, end){
  if(!ctx) return;

  const frameCount = end - start + 1;
  const local = Math.max(
    0,
    Math.min(frameCount - 1, Math.round(frame))
  );

  const imageNumber = start + local;
  const img = images[imageNumber];

  if(!img || !img.complete || !img.naturalWidth) return;

  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawCover(
    ctx,
    img,
    (mouseX - 0.5) * 10,
    (mouseY - 0.5) * 7
  );
}

function progress(section){
  if(!section) return 0;

  const rect = section.getBoundingClientRect();
  const scrollable = section.offsetHeight - window.innerHeight;

  if(scrollable <= 0) return 0;

  return Math.max(
    0,
    Math.min(1, -rect.top / scrollable)
  );
}

function updateHero(x){
  targetHeroFrame = x * (HERO_END - HERO_START);
  heroFrame += (targetHeroFrame - heroFrame) * 0.12;

  drawFrame(heroCtx, heroFrame, HERO_START, HERO_END);

  if(scrollPercent){
    scrollPercent.textContent = Math.round(x * 100) + "%";
  }

  let phase = heroPhases[0];

  for(const item of heroPhases){
    if(x >= item.start) phase = item;
  }

  if(phaseJP) phaseJP.textContent = phase.jp;
  if(phaseEN) phaseEN.textContent = phase.en;

  if(heroCopy){
    const opacity = x < 0.72
      ? Math.max(0, 1 - x / 0.72)
      : 0;

    heroCopy.style.opacity = opacity;
    heroCopy.style.transform = `translateY(${x * -80}px)`;
  }
}

/*
  SECOND SECTION
  47.png -> 62.png
  These 16 images already contain their own storyboard text,
  so the code only controls the cinematic scroll-scrub.
*/
function updateCombat(x){
  targetCombatFrame = x * (COMBAT_END - COMBAT_START);
  combatFrame += (targetCombatFrame - combatFrame) * 0.14;

  drawFrame(
    combatCtx,
    combatFrame,
    COMBAT_START,
    COMBAT_END
  );

  if(combatProgress){
    combatProgress.textContent = Math.round(x * 100) + "%";
  }
}

function updateGuy(x){
  if(!guyCtx) return;

  targetGuyFrame = x * (GUY_END - GUY_START);
  guyFrame += (targetGuyFrame - guyFrame) * 0.15;

  drawFrame(
    guyCtx,
    guyFrame,
    GUY_START,
    GUY_END
  );

  if(guyProgress){
    guyProgress.textContent = Math.round(x * 100) + "%";
  }

  let phase = guyPhases[0];

  for(const item of guyPhases){
    if(x >= item.start) phase = item;
  }

  if(guySmall) guySmall.textContent = phase.small;
  if(guyHeading) guyHeading.innerHTML = phase.heading;
  if(guyDescription) guyDescription.textContent = phase.description;

  if(guyCaption){
    const fadeIn = Math.min(1, x / 0.07);
    const fadeOut = x > 0.94
      ? Math.max(0, 1 - (x - 0.94) / 0.06)
      : 1;

    guyCaption.style.opacity = fadeIn * fadeOut;
    guyCaption.style.transform =
      `translateY(${(1 - fadeIn) * 25}px)`;
  }
}

function updateMemory(x){
  if(!memoryCtx) return;

  targetMemoryFrame = x * (MEMORY_END - MEMORY_START);
  memoryFrame += (targetMemoryFrame - memoryFrame) * 0.15;

  drawFrame(
    memoryCtx,
    memoryFrame,
    MEMORY_START,
    MEMORY_END
  );

  if(memoryProgress){
    memoryProgress.textContent = Math.round(x * 100) + "%";
  }

  let phase = memoryPhases[0];

  for(const item of memoryPhases){
    if(x >= item.start) phase = item;
  }

  if(memorySmall) memorySmall.textContent = phase.small;
  if(memoryHeading) memoryHeading.innerHTML = phase.heading;
  if(memoryDescription) memoryDescription.textContent = phase.description;

  if(memoryCaption){
    const fadeIn = Math.min(1, x / 0.07);
    const fadeOut = x > 0.94
      ? Math.max(0, 1 - (x - 0.94) / 0.06)
      : 1;

    memoryCaption.style.opacity = fadeIn * fadeOut;
    memoryCaption.style.transform =
      `translateY(${(1 - fadeIn) * 25}px)`;
  }
}

function updateFinal(x){
  if(!finalCtx) return;

  targetFinalFrame = x * (FINAL_END - FINAL_START);
  finalFrame += (targetFinalFrame - finalFrame) * 0.12;

  drawFrame(finalCtx, finalFrame, FINAL_START, FINAL_END);

  if(finalProgress){
    finalProgress.textContent = Math.round(x * 100) + "%";
  }

  // Let the last shot breathe, then fade gently to black.
  if(finalFade){
    const fade = x > 0.88 ? (x - 0.88) / 0.12 : 0;
    finalFade.style.opacity = Math.min(1, Math.max(0, fade));
  }
}

function animate(){
  updateHero(progress(hero));
  updateCombat(progress(combat));
  updateGuy(progress(guy));
  updateMemory(progress(memory));
  updateFinal(progress(finalSection));

  requestAnimationFrame(animate);
}

window.addEventListener("mousemove", e => {
  mouseX = e.clientX / window.innerWidth;
  mouseY = e.clientY / window.innerHeight;
});

window.addEventListener("resize", () => {
  resizeCanvas(heroCanvas, heroCtx);
  resizeCanvas(combatCanvas, combatCtx);
  resizeCanvas(guyCanvas, guyCtx);
  resizeCanvas(memoryCanvas, memoryCtx);
  resizeCanvas(finalCanvas, finalCtx);

  drawFrame(heroCtx, heroFrame, HERO_START, HERO_END);
  drawFrame(combatCtx, combatFrame, COMBAT_START, COMBAT_END);
  drawFrame(guyCtx, guyFrame, GUY_START, GUY_END);
  drawFrame(memoryCtx, memoryFrame, MEMORY_START, MEMORY_END);
  drawFrame(finalCtx, finalFrame, FINAL_START, FINAL_END);
});

async function start(){
  resizeCanvas(heroCanvas, heroCtx);
  resizeCanvas(combatCanvas, combatCtx);
  resizeCanvas(guyCanvas, guyCtx);
  resizeCanvas(memoryCanvas, memoryCtx);
  resizeCanvas(finalCanvas, finalCtx);

  await preloadImages();

  resizeCanvas(heroCanvas, heroCtx);
  resizeCanvas(combatCanvas, combatCtx);
  resizeCanvas(guyCanvas, guyCtx);
  resizeCanvas(memoryCanvas, memoryCtx);
  resizeCanvas(finalCanvas, finalCtx);

  drawFrame(heroCtx, 0, HERO_START, HERO_END);
  drawFrame(combatCtx, 0, COMBAT_START, COMBAT_END);
  drawFrame(guyCtx, 0, GUY_START, GUY_END);
  drawFrame(memoryCtx, 0, MEMORY_START, MEMORY_END);
  drawFrame(finalCtx, 0, FINAL_START, FINAL_END);

  setTimeout(() => {
    if(loader) loader.classList.add("hidden");
    requestAnimationFrame(animate);
  }, 500);
}

start();
