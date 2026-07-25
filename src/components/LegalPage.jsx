import { useEffect } from 'react'
import { useTranslation } from '../context/I18nContext'
import { getContactInfo } from '../lib/contactInfo'
import LanguageToggle from './LanguageToggle'

const EFFECTIVE_DATE = '2026-07-25'

const CONTENT = {
  ko: {
    common: {
      back: 'AnyMemo로 돌아가기',
      effectiveDate: '시행일',
      privacy: '개인정보 처리방침',
      terms: '서비스 이용약관',
      contact: '문의',
    },
    privacy: {
      intro:
        'AnyMemo는 개인이 운영하는 비상업·실험용 메모 서비스입니다. 운영자(이하 “운영자”)는 개인정보 보호법 등 관련 법령을 존중하며, 이용자의 개인정보를 아래와 같이 처리합니다. 본 서비스는 기업형 SaaS가 아니며, 가용성·데이터 영구 보존을 보장하지 않습니다.',
      sections: [
        {
          title: '1. 처리하는 개인정보와 이용 목적',
          body: [
            '회원가입 및 인증: 이메일 주소, 비밀번호 인증정보, 이용자 식별자',
            'Google 계정 이용 시: 이메일 주소, Google 계정 식별자 및 Google이 제공하는 기본 프로필 정보',
            '서비스 제공: 메모 제목·본문, 고정 및 정렬 정보, 생성·수정·삭제 시각',
            '서비스 안정성 및 보안: 접속·오류 기록이 외부 인프라(호스팅·인증 사업자)에 의해 자동 생성될 수 있습니다.',
            '위 정보는 계정 인증, 기기 간 메모 동기화, 문의 대응, 부정 이용 방지 및 서비스 운영에만 사용합니다. 마케팅·광고 목적, 제3자 판매에는 사용하지 않습니다.',
          ],
        },
        {
          title: '2. 개인정보 처리의 근거',
          body: [
            '회원가입, 인증 및 메모 동기화에 필요한 정보는 서비스 제공(이용계약 이행)을 위해 처리합니다.',
            '선택 기능이나 별도 동의가 필요한 처리가 추가되면, 내용을 확인하고 동의 여부를 결정할 수 있도록 별도 안내합니다.',
          ],
        },
        {
          title: '3. 보유 및 이용 기간',
          body: [
            '계정 및 메모는 원칙적으로 이용자가 계정을 유지하는 동안 보관합니다. 앱에서 회원 탈퇴하면 계정과 서버 메모가 삭제됩니다.',
            '휴지통으로 이동한 메모는 7일 후 자동 삭제되며, 이용자가 더 빨리 영구 삭제할 수 있습니다.',
            '기기에 저장된 오프라인 캐시·로그인 정보는 해당 기기/브라우저 저장공간을 지우면 제거됩니다.',
            '운영자는 서비스를 고의로 종료할 계획은 없습니다. 다만 장애·외부 인프라 한도·불가항력 등 예기치 않은 사유로 데이터에 접근하지 못하게 될 수 있으므로, 중요한 메모는 내보내기 등으로 정기적으로 백업해 두시기 바랍니다.',
          ],
        },
        {
          title: '4. 외부 서비스(처리 위탁·제공)',
          body: [
            'Supabase, Inc.: 회원 인증, 데이터베이스, 실시간 동기화',
            'Vercel Inc.: 웹 호스팅 및 콘텐츠 전송',
            'Google LLC: 이용자가 Google 로그인을 선택한 경우의 계정 인증',
            '운영자는 서비스 제공에 필요한 범위에서만 위 업체를 이용합니다. 업체 또는 처리 내용이 바뀌면 이 방침을 갱신합니다.',
          ],
        },
        {
          title: '5. 개인정보의 국외 처리',
          body: [
            '위 외부 서비스의 인프라 특성상 개인정보가 대한민국 외에서 처리·저장될 수 있습니다. 전송은 일반적으로 암호화된 연결을 통해 이루어집니다.',
            '저장 지역은 현재 사용 중인 Supabase 프로젝트 및 Vercel 설정에 따릅니다.',
          ],
        },
        {
          title: '6. 이용자의 권리와 행사 방법',
          body: [
            '이용자는 본인 개인정보에 대해 열람, 정정, 삭제, 처리정지 및 계정 삭제를 요청할 수 있습니다.',
            '메모 수정·삭제·회원 탈퇴는 앱에서 직접 할 수 있습니다(도움말 → 회원 탈퇴). 그 밖의 요청은 아래 이메일로 접수해 주세요. 본인 확인이 필요할 수 있습니다.',
          ],
        },
        {
          title: '7. 개인정보의 파기',
          body: [
            '보유 목적이 끝나거나 삭제 요청이 처리되면, 복구가 어렵도록 전자 파일을 삭제하는 방식으로 파기합니다. 외부 사업 백업 주기에 따라 완전 삭제까지 시간이 더 걸릴 수 있습니다.',
          ],
        },
        {
          title: '8. 안전성 확보 조치',
          body: [
            'HTTPS 전송, 인증 토큰 보호, 데이터베이스 접근 통제, 사용자별 행 수준 보안(RLS) 등 합리적인 범위의 보호조치를 적용합니다.',
            '개인이 운영하는 소규모 서비스이므로, 대기업 수준의 상시 모니터링·전담 보안팀을 보장하지는 않습니다. 민감 정보(비밀번호, 금융정보 등)를 메모에 저장하지 마세요.',
          ],
        },
        {
          title: '9. 로컬 저장소',
          body: [
            '로그인 상태, 언어·테마, 오프라인 메모를 위해 localStorage, sessionStorage, IndexedDB를 사용합니다.',
            '브라우저에서 저장 데이터를 지우면 자동 로그인·오프라인 기능이 제한될 수 있습니다.',
          ],
        },
        {
          title: '10. 아동의 개인정보',
          body: [
            '만 14세 미만의 아동이 법정대리인 동의 없이 가입·이용하도록 의도하지 않습니다. 해당 사실이 확인되면 계정을 제한하거나 삭제할 수 있습니다.',
          ],
        },
        {
          title: '11. 개인정보 보호 문의',
          body: [
            '개인정보 관련 문의, 불만, 권리 행사는 아래 이메일로 요청할 수 있습니다. 개인 프로젝트 특성상 응답에 시간이 걸릴 수 있습니다.',
          ],
        },
        {
          title: '12. 처리방침의 변경',
          body: [
            '이 방침을 변경하면 시행일과 함께 서비스 화면 또는 웹페이지에 게시합니다. 중요한 변경은 가능한 범위에서 미리 알리도록 노력합니다.',
          ],
        },
      ],
    },
    terms: {
      intro:
        '이 약관은 개인이 비상업·실험(토이) 목적으로 운영하는 AnyMemo(이하 “서비스”)의 이용 조건을 정합니다. 운영자(이하 “운영자”)와 이용자의 권리·의무를 규정하며, 서비스를 이용하면 이 약관에 동의한 것으로 봅니다.',
      sections: [
        {
          title: '1. 서비스의 성격',
          body: [
            'AnyMemo는 학습·실험용으로 공개된 개인 프로젝트이며, 유료 구독이나 상업적 SLA를 제공하지 않습니다. 운영자는 서비스를 고의로 내릴 계획은 없습니다.',
            '웹(Vercel 등)과 선택적 데스크톱/PWA 형태로 제공될 수 있으며, 기능·화면은 개선을 위해 변경될 수 있습니다.',
            '현재는 무료로 제공되며, 호스팅·데이터베이스 등 외부 인프라 한도에 따라 일시적으로 이용이 제한될 수 있습니다.',
          ],
        },
        {
          title: '2. 약관의 적용과 변경',
          body: [
            '회원가입 또는 서비스 이용 시 이 약관과 개인정보 처리방침에 동의한 것으로 봅니다.',
            '운영자는 약관을 변경할 수 있으며, 변경 내용과 시행일을 서비스 화면 또는 관련 페이지에 게시합니다.',
          ],
        },
        {
          title: '3. 계정',
          body: [
            '정확한 이메일로 계정을 만들고 로그인 정보를 안전하게 관리해야 합니다.',
            '계정의 무단 사용을 알게 되면 운영자에게 알려 주세요. 타인 계정 사용·양도는 금지됩니다.',
            '만 14세 미만은 법정대리인 동의 없이 가입할 수 없습니다.',
          ],
        },
        {
          title: '4. 서비스 제공과 가용성',
          body: [
            'AnyMemo는 메모 작성·검색·동기화·휴지통 등 기본 메모 기능을 제공합니다.',
            '운영자는 서비스를 고의로 종료할 계획은 없으나, 점검·장애·외부 서비스(Supabase, Vercel, Google 등) 변경·인프라 한도·불가항력 등으로 서비스의 전부 또는 일부가 일시 중단되거나 변경될 수 있습니다.',
            '예기치 않은 중단이 발생하면 가능한 범위에서 안내하고 복구를 위해 노력합니다.',
          ],
        },
        {
          title: '5. 이용자 콘텐츠',
          body: [
            '이용자가 작성한 메모의 권리는 이용자에게 있습니다. 운영자는 동기화·저장·서비스 제공에 필요한 범위에서만 처리합니다.',
            '불법 정보, 타인 권리 침해, 악성 코드, 타인의 개인정보·민감정보 무단 저장 등 법령이나 공서양속에 반하는 내용을 저장해서는 안 됩니다.',
          ],
        },
        {
          title: '6. 금지 행위',
          body: [
            '다른 이용자나 서비스의 정상 이용을 방해하는 행위',
            '보안을 우회하거나 무단으로 시스템에 접근하는 행위',
            '자동화·대량 요청 등으로 과도한 부하를 주거나 무료 인프라를 남용하는 행위',
            '관련 법령 또는 이 약관을 위반하는 행위',
          ],
        },
        {
          title: '7. 데이터 보관과 백업',
          body: [
            '운영자는 동기화를 위해 노력하지만, 데이터 유실·손상·일시 장애에 대한 완전 보장은 하지 않습니다.',
            '운영자는 서비스를 고의로 내릴 계획이 없더라도, 만약을 대비해 이용자는 중요한 메모를 내보내기 등으로 정기적으로 백업할 책임이 있습니다.',
            '계정 삭제·영구 삭제 후에는 데이터가 복구되지 않을 수 있습니다.',
          ],
        },
        {
          title: '8. 이용 제한 및 계약 종료',
          body: [
            '이용자는 언제든지 앱의 회원 탈퇴 기능으로 계정을 삭제할 수 있습니다. 탈퇴 시 서버에 저장된 메모도 함께 삭제됩니다.',
            '약관·법령 위반, 보안 위협, 과도한 자원 사용이 있으면 이용을 제한하거나 계정을 삭제할 수 있습니다. 긴급 보안 사유에서는 먼저 제한한 뒤 알릴 수 있습니다.',
          ],
        },
        {
          title: '9. 면책 및 책임의 제한',
          body: [
            '서비스는 “있는 그대로(AS IS)” 제공되며, 특정 목적에의 적합성·중단 없는 가용성·오류 없음을 보증하지 않습니다.',
            '운영자의 고의 또는 중대한 과실이 없는 한, 데이터 손실, 서비스 중단, 통신·외부 인프라 장애, 이용자 기기 문제로 인한 손해에 대해 책임을 지지 않습니다.',
            '관련 법령상 책임을 배제할 수 없는 경우에는 그 법령이 허용하는 한도 내에서만 책임이 제한됩니다.',
          ],
        },
        {
          title: '10. 준거법 및 분쟁 해결',
          body: [
            '이 약관은 대한민국 법률에 따릅니다. 분쟁은 우선 협의로 해결하고, 합의되지 않으면 관련 법령이 정한 관할 법원에서 해결합니다.',
          ],
        },
        {
          title: '11. 문의',
          body: [
            '서비스·약관 문의는 아래 이메일로 접수할 수 있습니다. 개인 운영 특성상 즉시 응답을 보장하지는 않습니다.',
          ],
        },
      ],
    },
  },
  en: {
    common: {
      back: 'Back to AnyMemo',
      effectiveDate: 'Effective date',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service',
      contact: 'Contact',
    },
    privacy: {
      intro:
        'AnyMemo is a personal, non-commercial experimental memo service. The operator (“we”) respects applicable privacy laws and processes personal information as described below. This is not enterprise SaaS; we do not guarantee uptime or permanent data retention.',
      sections: [
        {
          title: '1. Information we process and why',
          body: [
            'Account and authentication: email address, password authentication data, and user identifier.',
            'Google sign-in: email address, Google account identifier, and basic profile information supplied by Google.',
            'Service data: memo titles and bodies, pin and sort data, and creation, update, and deletion timestamps.',
            'Security and reliability: access or error logs may be generated automatically by hosting and auth providers.',
            'We use this only to authenticate accounts, sync memos, respond to requests, prevent abuse, and operate the service. We do not sell personal data or use it for advertising.',
          ],
        },
        {
          title: '2. Basis for processing',
          body: [
            'We process information needed for registration, authentication, and memo sync to provide the service (perform our agreement with you).',
            'If we add optional processing that requires consent, we will explain it and let you choose.',
          ],
        },
        {
          title: '3. Retention',
          body: [
            'Account and memo data is generally kept while your account remains active. Deleting your account in the app removes the account and memos on the server.',
            'Memos in Trash are automatically deleted after 7 days and can be permanently deleted sooner.',
            'Offline cache and sign-in data on your device are removed when you clear app or browser storage.',
            'We do not plan to shut the service down on purpose. Still, unexpected outages, provider limits, or force majeure could make data temporarily or permanently inaccessible—so please export and regularly back up important memos.',
          ],
        },
        {
          title: '4. Service providers',
          body: [
            'Supabase, Inc.: authentication, database, and real-time synchronization.',
            'Vercel Inc.: web hosting and delivery.',
            'Google LLC: authentication when you choose Google sign-in.',
            'We use these providers only as needed to run the service and will update this policy if that changes.',
          ],
        },
        {
          title: '5. International processing',
          body: [
            'Because of how these providers operate, personal information may be processed or stored outside your country, usually over encrypted connections.',
            'The storage region depends on the active Supabase project and Vercel settings.',
          ],
        },
        {
          title: '6. Your rights',
          body: [
            'You may request access, correction, deletion, restriction of processing, or account deletion.',
            'You can edit or delete memos and delete your account in the app (Help → Delete account). For other requests, email the address below. We may verify your identity first.',
          ],
        },
        {
          title: '7. Deletion',
          body: [
            'When retention is no longer needed or a deletion request is processed, we delete electronic files in ways intended to prevent recovery. Provider backup cycles may delay complete removal.',
          ],
        },
        {
          title: '8. Security',
          body: [
            'We apply reasonable safeguards such as HTTPS, auth-token protection, database access controls, and per-user row-level security (RLS).',
            'As a small personal project, we do not promise enterprise-grade monitoring. Do not store passwords, financial data, or other highly sensitive information in memos.',
          ],
        },
        {
          title: '9. Device storage',
          body: [
            'We use localStorage, sessionStorage, and IndexedDB for sign-in state, language and theme preferences, and offline memos.',
            'Clearing this data in your browser may disable automatic sign-in and offline features.',
          ],
        },
        {
          title: '10. Children',
          body: [
            'We do not intend anyone under 14 to register without a legal guardian’s consent. If we learn that has happened, we may restrict or delete the account.',
          ],
        },
        {
          title: '11. Privacy contact',
          body: [
            'Use the email below for privacy questions, complaints, and rights requests. As a personal project, replies may take time.',
          ],
        },
        {
          title: '12. Changes',
          body: [
            'We will post updates to this policy with an effective date on the service or related pages, and try to give advance notice for material changes when practical.',
          ],
        },
      ],
    },
    terms: {
      intro:
        'These Terms govern AnyMemo, a personal non-commercial experimental (“toy”) project (the “service”). They set out the rights and responsibilities of you and the operator (“we”). By registering or using the service, you agree to these Terms.',
      sections: [
        {
          title: '1. Nature of the service',
          body: [
            'AnyMemo is a personal learning/experimental project. It is not a paid subscription product and does not offer a commercial SLA. We do not plan to shut the service down on purpose.',
            'It may be offered as a web app (e.g. on Vercel) and optionally as a desktop or PWA build. Features and UI may change as the project improves.',
            'The service is currently free; use may be temporarily limited by hosting or database provider quotas.',
          ],
        },
        {
          title: '2. Acceptance and changes',
          body: [
            'By signing up or using the service, you agree to these Terms and the Privacy Policy.',
            'We may change these Terms and will post the changes and effective date on the service or related pages.',
          ],
        },
        {
          title: '3. Accounts',
          body: [
            'Use an accurate email address and keep your credentials secure.',
            'Tell us if you notice unauthorized use. You may not use or transfer another person’s account.',
            'Users under 14 may not register without consent from a legal guardian.',
          ],
        },
        {
          title: '4. Availability',
          body: [
            'AnyMemo provides basic memo features such as editing, search, sync, and trash.',
            'We do not plan to shut the service down on purpose. Still, maintenance, outages, changes at Supabase, Vercel, Google, or other providers, infrastructure quotas, or force majeure may temporarily interrupt or change all or part of the service.',
            'If an unexpected interruption occurs, we will try to communicate and restore service when practical.',
          ],
        },
        {
          title: '5. Your content',
          body: [
            'You retain rights in your memos. We process them only as needed to store, sync, and provide the service.',
            'Do not store unlawful content, content that infringes others’ rights, malware, or others’ personal or sensitive information without authorization.',
          ],
        },
        {
          title: '6. Prohibited conduct',
          body: [
            'Disrupting the service or another user’s normal use.',
            'Bypassing security or accessing systems without authorization.',
            'Creating excessive load through automation or abusing free infrastructure.',
            'Violating applicable law or these Terms.',
          ],
        },
        {
          title: '7. Data and backups',
          body: [
            'We aim for useful sync, but we do not fully guarantee against data loss, corruption, or temporary outages.',
            'Even though we do not plan to take the service down on purpose, you are responsible for regularly backing up important memos (for example via export) just in case.',
            'After account deletion or permanent deletion, data may not be recoverable.',
          ],
        },
        {
          title: '8. Suspension and termination',
          body: [
            'You may delete your account at any time with the in-app Delete account action. Deleting your account also removes memos stored on the server.',
            'We may restrict use or delete an account for Terms or legal violations, security threats, or excessive resource use. For urgent security reasons, we may restrict first and notify afterward.',
          ],
        },
        {
          title: '9. Disclaimer and limitation of liability',
          body: [
            'The service is provided “AS IS,” without warranties of fitness for a particular purpose, uninterrupted availability, or freedom from errors.',
            'Unless caused by our willful misconduct or gross negligence, we are not liable for data loss, downtime, network or third-party infrastructure failures, or issues with your device.',
            'Where liability cannot be excluded by law, it is limited to the maximum extent permitted.',
          ],
        },
        {
          title: '10. Governing law and disputes',
          body: [
            'These Terms are governed by the laws of the Republic of Korea. We will first try to resolve disputes by discussion; unresolved disputes will be handled by the court with jurisdiction under applicable law.',
          ],
        },
        {
          title: '11. Contact',
          body: [
            'Send service or Terms questions to the email below. As a personally run project, we do not guarantee immediate replies.',
          ],
        },
      ],
    },
  },
}

export function LegalBody({ type }) {
  const { locale } = useTranslation()
  const { email, mailto } = getContactInfo()
  const localized = CONTENT[locale] || CONTENT.ko
  const page = localized[type]

  return (
    <>
      <p className="mb-8 text-sm leading-7 text-zinc-600 dark:text-zinc-300">
        {page.intro}
      </p>

      <div className="space-y-8">
        {page.sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
              {section.title}
            </h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-600 dark:text-zinc-300">
              {section.body.map((paragraph) => (
                <li key={paragraph} className="flex gap-2">
                  <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />
                  <span>{paragraph}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="mt-10 border-t border-zinc-200 pt-6 text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        <span className="font-medium">{localized.common.contact}: </span>
        <a
          href={mailto}
          className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          {email}
        </a>
      </div>
    </>
  )
}

export default function LegalPage({ type }) {
  const { locale } = useTranslation()
  const localized = CONTENT[locale] || CONTENT.ko
  const title = localized.common[type]

  useEffect(() => {
    document.title = `${title} · AnyMemo`
    return () => {
      document.title = 'AnyMemo'
    }
  }, [title])

  return (
    <div className="min-h-svh bg-zinc-50 px-4 py-6 text-zinc-800 safe-top safe-bottom dark:bg-zinc-950 dark:text-zinc-200 sm:py-10">
      <main className="mx-auto max-w-3xl rounded-xl border border-zinc-200 bg-white px-5 py-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:px-10 sm:py-9">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <a
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
            >
              ← {localized.common.back}
            </a>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-xs text-zinc-400 dark:text-zinc-500">
              {localized.common.effectiveDate}: {EFFECTIVE_DATE}
            </p>
          </div>
          <LanguageToggle />
        </div>

        <LegalBody type={type} />

        <nav className="mt-4 flex gap-4 text-sm">
          <a
            href="/terms"
            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {localized.common.terms}
          </a>
          <a
            href="/privacy"
            className="underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            {localized.common.privacy}
          </a>
        </nav>
      </main>
    </div>
  )
}
