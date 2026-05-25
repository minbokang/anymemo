const DEFAULT_GITHUB_REPO = 'minbokang/anymemo'
const DEFAULT_CONTACT_EMAIL = 'mbkang@gmail.com'

export function getContactInfo() {
  const repo =
    import.meta.env.VITE_GITHUB_REPO?.trim() || DEFAULT_GITHUB_REPO
  const email =
    import.meta.env.VITE_CONTACT_EMAIL?.trim() || DEFAULT_CONTACT_EMAIL
  return {
    githubUrl: `https://github.com/${repo}`,
    githubLabel: `github.com/${repo}`,
    email,
    mailto: `mailto:${email}`,
  }
}
