import nextConfig from 'eslint-config-next'

const config = [
  // Ignore shadcn/ui components — copy-pasted library code, not authored here
  { ignores: ['src/components/ui/**'] },
  ...nextConfig,
]

export default config
