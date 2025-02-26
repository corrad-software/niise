import { ref } from 'vue'

export const useRecaptcha = () => {
  const recaptchaToken = ref('')
  const recaptchaWidgetId = ref<number | null>(null)
  const config = useRuntimeConfig()

  const initRecaptcha = () => {
    if (typeof window === 'undefined') return

    return new Promise((resolve) => {
      // Add script only if not already added
      if (!document.querySelector('#recaptcha-script')) {
        const script = document.createElement('script')
        script.id = 'recaptcha-script'
        script.src = `https://www.google.com/recaptcha/api.js?render=explicit`
        script.async = true
        script.defer = true
        
        script.onload = () => {
          window.grecaptcha.ready(() => {
            resolve(true)
          })
        }
        
        document.head.appendChild(script)
      } else {
        resolve(true)
      }
    })
  }

  const renderRecaptcha = (elementId: string) => {
    if (typeof window === 'undefined' || !window.grecaptcha) return

    // Reset if already rendered
    if (recaptchaWidgetId.value !== null) {
      window.grecaptcha.reset(recaptchaWidgetId.value)
      return
    }

    recaptchaWidgetId.value = window.grecaptcha.render(elementId, {
      sitekey: config.public.recaptcha.siteKey,
      callback: (token: string) => {
        recaptchaToken.value = token
      },
      'expired-callback': () => {
        recaptchaToken.value = ''
      }
    })
  }

  const resetRecaptcha = () => {
    if (typeof window === 'undefined' || !window.grecaptcha || recaptchaWidgetId.value === null) return
    
    window.grecaptcha.reset(recaptchaWidgetId.value)
    recaptchaToken.value = ''
  }

  return {
    recaptchaToken,
    initRecaptcha,
    renderRecaptcha,
    resetRecaptcha
  }
}

// Add type declaration for window object
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      render: (element: string | HTMLElement, options: any) => number
      reset: (widgetId: number) => void
    }
  }
} 