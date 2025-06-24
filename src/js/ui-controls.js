// Custom UI Controls - Knobs and Switches
export class BaseKnob extends EventTarget {
    constructor(container, label, options) {
        super();
        this.container = container;
        this.options = options;
        this.isDragging = false;
        this.value = options.initial;
        this.angle = this.valueToAngle(this.value);
        this.createDOM(label, options.isSwitch);
        this.addEventListeners();
        this.updateVisuals();
    }

    createDOM(label, isSwitch = false) {
        const size = 80;
        const svgNS = "http://www.w3.org/2000/svg";
        const svg = document.createElementNS(svgNS, "svg");
        svg.setAttribute("class", "knob");
        svg.setAttribute("width", size);
        svg.setAttribute("height", size);
        svg.setAttribute("viewBox", `0 0 ${size} ${size}`);

        const background = document.createElementNS(svgNS, "circle");
        background.setAttribute("cx", size / 2);
        background.setAttribute("cy", size / 2);
        background.setAttribute("r", size / 2 * 0.9);
        background.setAttribute("fill", "#1f2937");
        background.setAttribute("stroke", "#4b5563");
        background.setAttribute("stroke-width", "2");
        svg.appendChild(background);

        const indicator = document.createElementNS(svgNS, "circle");
        indicator.setAttribute("r", 4);
        indicator.setAttribute("fill", "#4ade80");
        this.indicator = indicator;
        svg.appendChild(indicator);
        
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", "50%");
        text.setAttribute("y", "50%");
        text.setAttribute("dy", "0.3em");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("font-family", "Roboto Mono, monospace");
        text.setAttribute("font-size", isSwitch ? "24" : "14");
        text.setAttribute("font-weight", "bold");
        text.setAttribute("fill", "#f3f4f6");
        this.text = text;
        svg.appendChild(text);
        
        const labelText = document.createElement("div");
        labelText.textContent = label;
        labelText.className = "text-sm mt-1";

        this.container.appendChild(svg);
        this.container.appendChild(labelText);
    }    addEventListeners() {
        this.mouseDownHandler = (e) => this.startDrag(e);
        this.mouseMoveHandler = (e) => this.drag(e);
        this.mouseUpHandler = (e) => this.endDrag(e);
        this.touchStartHandler = (e) => this.startDrag(e);
        this.touchMoveHandler = (e) => this.drag(e);
        this.touchEndHandler = (e) => this.endDrag(e);

        this.container.addEventListener("mousedown", this.mouseDownHandler);
        window.addEventListener("mousemove", this.mouseMoveHandler);
        window.addEventListener("mouseup", this.mouseUpHandler);
        this.container.addEventListener("touchstart", this.touchStartHandler, { passive: false });
        window.addEventListener("touchmove", this.touchMoveHandler, { passive: false });
        window.addEventListener("touchend", this.touchEndHandler);
    }

    cleanup() {
        if (this.container) {
            this.container.removeEventListener("mousedown", this.mouseDownHandler);
            this.container.removeEventListener("touchstart", this.touchStartHandler);
        }
        window.removeEventListener("mousemove", this.mouseMoveHandler);
        window.removeEventListener("mouseup", this.mouseUpHandler);
        window.removeEventListener("touchmove", this.touchMoveHandler);
        window.removeEventListener("touchend", this.touchEndHandler);
    }

    startDrag(e) { 
        e.preventDefault(); 
        this.isDragging = true; 
        this.container.style.cursor = 'grabbing'; 
    }

    endDrag() { 
        this.isDragging = false; 
        this.container.style.cursor = 'pointer'; 
    }

    setValue(newValue) {
        if (this.isDragging) return;
        this.value = Math.max(this.options.min, Math.min(this.options.max, newValue));
        this.angle = this.valueToAngle(this.value);
        this.updateVisuals();
    }

    updateVisuals() {
        const size = 80;
        const radius = size/2 * 0.7;
        this.indicator.setAttribute("cx", size / 2 + radius * Math.sin(this.angle));
        this.indicator.setAttribute("cy", size / 2 - radius * Math.cos(this.angle));
        if(this.text) {
            this.text.textContent = this.value.toFixed(this.options.precision || 0);
        }
    }
}

export class RotarySwitch extends BaseKnob {
    constructor(container, label, options) {
        super(container, label, {...options, isSwitch: true, precision: 0});
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const currentAngle = (Math.atan2(clientY - centerY, clientX - centerX) + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
        const numSteps = this.options.max - this.options.min + 1;
        const stepAngle = (2 * Math.PI) / numSteps;
        let valueIndex = Math.round(currentAngle / stepAngle);
        valueIndex = valueIndex % numSteps;
        const newValue = this.options.min + valueIndex;
        if (newValue !== this.value) {
            this.value = newValue;
            this.angle = this.valueToAngle(this.value);
            this.updateVisuals();
            this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
        }
    }

    valueToAngle(value) {
        const numSteps = this.options.max - this.options.min + 1;
        const stepAngle = (2 * Math.PI) / numSteps;
        return (value - this.options.min) * stepAngle;
    }
}

export class Knob extends BaseKnob {
    constructor(container, label, options) {
        super(container, label, {...options, isSwitch: false});
    }

    drag(e) {
        if (!this.isDragging) return;
        e.preventDefault();
        const rect = this.container.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const dx = clientX - centerX;
        const dy = clientY - centerY;
        this.angle = (Math.atan2(dy, dx) + Math.PI / 2 + 2 * Math.PI)%(2*Math.PI);
        this.value = this.angleToValue(this.angle);
        this.updateVisuals();
        this.dispatchEvent(new CustomEvent('change', { detail: { value: this.value } }));
    }

    updateVisuals() {
        super.updateVisuals();
        if(this.options.isPhase) {
            this.text.textContent = `${this.value.toFixed(2)}π`;
        }
    }

    angleToValue(angle) {
        return (angle / (2 * Math.PI)) * (this.options.max - this.options.min) + this.options.min;
    }

    valueToAngle(value) { 
        return ((value - this.options.min) / (this.options.max - this.options.min)) * 2 * Math.PI; 
    }
}
