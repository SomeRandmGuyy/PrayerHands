import { cva, type VariantProps } from 'class-variance-authority'

/** shadcn-vue button variants. Hand-authored for Nuxt 4 (reka-ui + cva + tailwind). */
export const buttonVariants = cva(
  'inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-md font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fist',
  {
    variants: {
      variant: {
        default: 'bg-fist text-white hover:bg-fist-deep',
        outline: 'border border-line bg-card text-ink hover:bg-mist',
        ghost: 'text-ink hover:bg-mist',
      },
      size: {
        sm: 'h-7 px-2 text-[12px]',
        md: 'h-8 px-2.5 text-[13px]',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'sm',
    },
  },
)

export type ButtonVariants = VariantProps<typeof buttonVariants>
