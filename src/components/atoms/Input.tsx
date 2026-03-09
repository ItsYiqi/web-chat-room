import { InputHTMLAttributes, forwardRef } from 'react'
import styles from './Input.module.scss'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label?:   string
  error?:   string
  hint?:    string
}

const Input = forwardRef<HTMLInputElement, Props>(({
  label, error, hint, className, id, ...rest
}, ref) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className={[styles.wrapper, error ? styles.hasError : '', className ?? ''].join(' ')}>
      {label && <label className={styles.label} htmlFor={inputId}>{label}</label>}
      <input
        ref={ref}
        id={inputId}
        className={styles.input}
        {...rest}
      />
      {error && <p className={styles.error}>{error}</p>}
      {hint && !error && <p className={styles.hint}>{hint}</p>}
    </div>
  )
})

Input.displayName = 'Input'
export default Input
