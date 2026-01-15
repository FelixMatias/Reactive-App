// Default options when user doesn't specify
const DEFAULT_OPTIONS = {autoClose: 5000, position: "top-right", type: "info"}
// Stores unique string identifiers that acts as unique ID for each toast
const activeMessages = new Set<string>()
// Create or looks for existing container for given position
function createContainer(position: string) {
    // Look for an existing toast container at the given position
    let container:HTMLDivElement | null = document.querySelector(`.toast-container[data-position="${position}"]`)
    if (!container) {
    // Create a new container div
    container = document.createElement("div")
    container.classList.add("toast-container")
    // Store the container's position as a data attribute
    container.dataset.position = position
    // Append the container to the document body
    document.body.append(container)
    }
    return container
}

export class Toast {
    // The toast DOM element
    element!: HTMLDivElement
    // Timer reference for automatic removal
    autoCloseTimeout: ReturnType<typeof setTimeout> | null = null
    // Unique identifier for duplicate prevention (type + text)
    textKey: string
    // Callback function invoked when the toast is removed
    onClose:() => void = () => {}

    constructor (options: {text:string; position?: string; autoClose?: number | false; onClose?: () => void; type?: string}) {
        // Determine toast type, fallback to default
        const type = options.type ?? DEFAULT_OPTIONS.type
        // Create unique key combining type and text for duplicate tracking
        this.textKey = `${type}:${options.text}`  
        // Skip creation if the same toast is already visible
        if (activeMessages.has(this.textKey)) return
        activeMessages.add(this.textKey)
        // Store the onClose callback, or default to empty function
        this.onClose = options.onClose ?? (() => {})
        // Create the toast DOM element
        this.createElement(options.text,type)
        // Append toast to the appropriate position container
        this.appendToContainer(options.position ?? DEFAULT_OPTIONS.position)
        // Set up auto-close timer
        this.setAutoClose(options.autoClose ?? DEFAULT_OPTIONS.autoClose)
        // Enable removal on click
        this.clickToRemove()
    }
    //Create toast DOM element
    private createElement(text: string, type: string) {
        this.element = document.createElement("div")
        this.element.className = `toast ${type}`
        this.element.dataset.type = type
        this.element.textContent = text
    }
    private appendToContainer(position: string) {
        const container = createContainer(position)
        container.append(this.element)
    }
    private setAutoClose(delay: number | false) {
        if (delay === false) return
        this.autoCloseTimeout = setTimeout(() => this.remove(), delay)
    }
    private clickToRemove() {
        this.element.addEventListener("click", () => this.remove())
    }
    remove() {
        // Exit if the toast has no parent (already removed)
        if(!this.element.parentElement) return
        // Clear the auto-close timer, if any
        if(this.autoCloseTimeout) clearTimeout(this.autoCloseTimeout)
        // Remove this toast's unique key from activeMessages
        activeMessages.delete(this.textKey)
        // Store reference to the parent container before removing the toast
        const container = this.element.parentElement
        // Remove the toast element from the DOM
        this.element.remove()
        // Trigger the onClose callback, if provided
        this.onClose()
        // Remove the container if it has no more toasts
        if (container && container.children.length === 0) container.remove()
    }
}
//Helper functions to create typed toasts
export const toast = {
 success: (text: string, options = {}) => new Toast({ text, type: "success", ...options }),
 error: (text: string, options = {}) => new Toast({ text, type: "error", ...options, autoClose: false }),
 warning: (text: string, options = {}) => new Toast({ text, type: "warning", ...options }),
 info: (text: string, options = {}) => new Toast({ text, type: "info", ...options, autoClose: false }),
}
  