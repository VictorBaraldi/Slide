import debounce from "./debounce.js";

export class Slide {
  constructor(slide, wrapper) {
    this.slide = document.querySelector(slide);
    this.wrapper = document.querySelector(wrapper);
    this.dist = { finalPosition: 0, startX: 0, movement: 0, movePosition: 0 };
    this.changeEvent = new Event("changeEvent");
  }

  transition(active) {
    this.slide.style.transition = active ? "transform .5s" : "";
  }

  moveSlide(distX) {
    this.dist.movePosition = distX;
    this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
  }

  updatePosition(clientX) {
    this.dist.movement = (clientX - this.dist.startX) * 1.5;
    return this.dist.movement + this.dist.finalPosition;
  }

  onStart(event) {
    if (event.type === "mousedown") {
      event.preventDefault();
      this.dist.startX = event.clientX;
      this.wrapper.addEventListener("mousemove", this.onMove);
    } else {
      this.dist.startX = event.changedTouches[0].clientX;
      this.wrapper.addEventListener("touchmove", this.onMove);
      this.transition(false);
    }
  }

  onMove(event) {
    let finalPosition;
    if (event.type === "mousemove") {
      finalPosition = this.updatePosition(event.clientX);
    } else {
      finalPosition = this.updatePosition(event.changedTouches[0].clientX);
    }
    this.moveSlide(finalPosition);
  }

  onEnd(event) {
    const moveType = event.type === "mouseup" ? "mousemove" : "touchmove";
    this.wrapper.removeEventListener(moveType, this.onMove);
    this.dist.finalPosition = this.dist.movePosition;
    this.changeSlideOnEnd();
    this.transition(true);
  }

  changeSlideOnEnd() {
    if (this.dist.movement > 120 && this.index.prev !== undefined) {
      this.activePrevSlide();
    } else if (this.dist.movement < -120 && this.index.next !== undefined) {
      this.activeNextSlide();
    } else {
      this.slideChange(this.index.active);
    }
  }

  addSlideEvents() {
    this.wrapper.addEventListener("mousedown", this.onStart);
    this.wrapper.addEventListener("touchstart", this.onStart);
    this.wrapper.addEventListener("mouseup", this.onEnd);
    this.wrapper.addEventListener("touchend", this.onEnd);
  }

  // Slide config
  slidePosition(slide) {
    const margin = (this.wrapper.offsetWidth - slide.offsetWidth) / 2;
    return -(slide.offsetLeft - margin);
  }

  slidesConfig() {
    this.slideArray = [...this.slide.children].map((element) => {
      const position = this.slidePosition(element);
      return { position, element };
    });
  }

  slideIndexNav(index) {
    const last = this.slideArray.length - 1;
    this.index = {
      prev: index ? index - 1 : undefined,
      active: index,
      next: index === last ? undefined : index + 1,
    };
  }

  slideChange(index) {
    const activeSlide = this.slideArray[index];
    this.moveSlide(this.slideArray[index].position);
    this.slideIndexNav(index);
    this.changeActiveClass();
    this.dist.finalPosition = activeSlide.position;
    this.wrapper.dispatchEvent(this.changeEvent);
  }

  changeActiveClass() {
    this.slideArray.forEach((value) =>
      value.element.classList.remove("active")
    );
    this.slideArray[this.index.active].element.classList.add("active");
  }

  activePrevSlide() {
    if (this.index.prev !== undefined) this.slideChange(this.index.prev);
  }

  activeNextSlide() {
    if (this.index.next !== undefined) this.slideChange(this.index.next);
  }

  onResize() {
    setTimeout(() => {
      this.slidesConfig();
      this.slideChange(this.index.active);
    }, 100);
  }

  addResizeEvent() {
    window.addEventListener("resize", this.onResize);
  }

  bindEvents() {
    this.onStart = this.onStart.bind(this);
    this.onEnd = this.onEnd.bind(this);
    this.onMove = this.onMove.bind(this);
    this.onResize = debounce(this.onResize.bind(this), 200);
    this.activeNextSlide = this.activeNextSlide.bind(this);
    this.activePrevSlide = this.activePrevSlide.bind(this);
  }

  init() {
    this.bindControlEvents();
    this.transition(true);
    this.bindEvents();
    this.slidesConfig();
    this.addSlideEvents();
    this.addResizeEvent();
    this.slideChange(0);
    return this;
  }
}

export default class SlideNav extends Slide {
  addArrow(prev, next) {
    this.prevElement = document.querySelector(prev);
    this.nextElement = document.querySelector(next);
    this.ObserverNav();
  }

  ObserverNav() {
    this.prevElement.addEventListener("click", this.activePrevSlide);
    this.nextElement.addEventListener("click", this.activeNextSlide);
  }

  addControl(selector) {
    this.control = document.querySelector(selector) || this.createControl();
    this.controlArray = [...this.control.children];
    this.activeControlItem();
    this.controlArray.forEach((item, index) => {
      item.addEventListener("click", (event) => {
        event.preventDefault();
        this.slideChange(index);
      });
      this.wrapper.addEventListener("changeEvent", this.activeControlItem);
    });
  }

  createControl() {
    const control = document.createElement("ul");
    control.dataset.control = "slide";
    this.slideArray.forEach((value, index) => {
      control.innerHTML += `<li><a href="#slide${index + 1} ">${
        index + 1
      }</a></li>`;
    });
    this.wrapper.appendChild(control);
    return control;
  }

  activeControlItem() {
    this.controlArray.forEach((value) => value.classList.remove("active"));
    this.controlArray[this.index.active].classList.add("active");
  }

  bindControlEvents() {
    this.activeControlItem = this.activeControlItem.bind(this);
  }
}
