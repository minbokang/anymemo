const DEFAULT_APP_URL = 'https://anymemo.vercel.app'
const DEFAULT_GITHUB_REPO = 'minbokang/anymemo'
const DEFAULT_RELEASE_TAG = 'v0.1.0'

function releaseAssetUrl(filename) {
  return `https://github.com/${DEFAULT_GITHUB_REPO}/releases/download/${DEFAULT_RELEASE_TAG}/${filename}`
}

export function getAppUrl() {
  const fromEnv = import.meta.env.VITE_APP_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin
  }
  return DEFAULT_APP_URL
}

export function getGithubReleasesUrl() {
  const direct = import.meta.env.VITE_GITHUB_RELEASES_URL?.trim()
  if (direct) return direct
  const repo = import.meta.env.VITE_GITHUB_REPO?.trim() || DEFAULT_GITHUB_REPO
  return `https://github.com/${repo}/releases/latest`
}

/**
 * @returns {'ios' | 'android' | 'mac' | 'windows' | 'web'}
 */
export function detectInstallPlatform() {
  if (typeof navigator === 'undefined') return 'web'
  const ua = navigator.userAgent
  if (/android/i.test(ua)) return 'android'
  if (/iPhone|iPad|iPod/i.test(ua)) return 'ios'
  if (/Macintosh|Mac OS X/i.test(ua)) return 'mac'
  if (/Win/i.test(ua)) return 'windows'
  return 'web'
}

export function getPlatformInstallLinks() {
  const appUrl = getAppUrl()
  const releasesUrl = getGithubReleasesUrl()

  const macDownload =
    import.meta.env.VITE_DOWNLOAD_MAC_DMG?.trim() ||
    import.meta.env.VITE_DOWNLOAD_MAC?.trim() ||
    releaseAssetUrl('AnyMemo_0.1.0_aarch64.dmg')

  const macZip = releaseAssetUrl('AnyMemo_0.1.0_macos_aarch64.zip')

  const windowsDownload =
    import.meta.env.VITE_DOWNLOAD_WINDOWS_MSI?.trim() ||
    import.meta.env.VITE_DOWNLOAD_WINDOWS?.trim() ||
    releasesUrl

  return {
    appUrl,
    releasesUrl,
    macDownload,
    macZip,
    windowsDownload,
  }
}
