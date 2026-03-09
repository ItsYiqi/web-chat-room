import { ButtonHTMLAttributes } from 'react'
import styles from './Button.module.scss'
import Spinner from './Spinner'

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  variant = 'primary',
  loading = false,
  fullWidth = false,
  disabled,
  children,
  className,
  ...rest
}: Props) {
  return (
    <button
      className={[
        styles.btn,
        styles[variant],
        fullWidth  ? styles.full : '',
        loading    ? styles.loading : '',
        className  ?? '',
      ].join(' ')}
      disabled={disabled || loading}
      {...rest}
    >
      {loading && <Spinner size={16} />}
      <span>{children}</span>
    </button>
  )
}
