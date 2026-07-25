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
        'AnyMemo 운영자(이하 “운영자”)는 개인정보 보호법 등 관련 법령을 준수하며, 이용자의 개인정보를 다음과 같이 처리합니다.',
      sections: [
        {
          title: '1. 처리하는 개인정보와 이용 목적',
          body: [
            '회원가입 및 인증: 이메일 주소, 비밀번호 인증정보, 이용자 식별자',
            'Google 계정 이용 시: 이메일 주소, Google 계정 식별자 및 Google이 제공하는 기본 프로필 정보',
            '서비스 제공: 메모 제목·본문, 고정 및 정렬 정보, 생성·수정·삭제 시각',
            '서비스 안정성 및 보안: 접속 기록, IP 주소, 브라우저·기기 정보, 오류 기록이 자동으로 생성될 수 있습니다.',
            '위 정보는 계정 인증, 기기 간 메모 동기화, 데이터 복구, 문의 대응, 부정 이용 방지 및 서비스 안정성 확보에 사용합니다.',
          ],
        },
        {
          title: '2. 개인정보 처리의 법적 근거',
          body: [
            '회원가입, 인증 및 메모 동기화에 필요한 정보는 이용자와의 서비스 이용계약 체결 및 이행을 위해 처리합니다.',
            '선택 기능 또는 별도 동의가 필요한 처리가 추가되는 경우, 이용자가 내용을 확인하고 자유롭게 결정할 수 있도록 별도로 안내합니다.',
          ],
        },
        {
          title: '3. 보유 및 이용 기간',
          body: [
            '계정 및 메모 정보는 회원 탈퇴 시까지 보관하며, 탈퇴 시 지체 없이 삭제합니다. 다만 관계 법령에 따라 보존할 의무가 있는 정보는 해당 기간 동안 분리하여 보관합니다.',
            '휴지통으로 이동한 메모는 7일 후 자동 삭제되며, 이용자가 직접 영구 삭제할 수 있습니다.',
            '기기에 저장된 오프라인 캐시와 로그인 정보는 앱 데이터 또는 브라우저 저장공간을 삭제하면 제거됩니다.',
          ],
        },
        {
          title: '4. 처리 위탁 및 외부 서비스',
          body: [
            'Supabase, Inc.: 회원 인증, 데이터베이스, 실시간 동기화 제공',
            'Vercel Inc.: 웹 서비스 호스팅 및 전송',
            'Google LLC: 이용자가 Google 로그인을 선택한 경우 계정 인증',
            '운영자는 위 업체의 서비스 이용에 필요한 범위에서만 정보를 처리하며, 위탁업체 또는 처리 내용이 변경되면 이 방침을 통해 공개합니다.',
          ],
        },
        {
          title: '5. 개인정보의 국외 처리',
          body: [
            '위 외부 서비스의 인프라 운영 과정에서 개인정보가 국외에서 처리될 수 있습니다. 전송은 암호화된 네트워크를 통해 서비스 이용 시 이루어지며, 계정 삭제 또는 각 업체와의 계약 종료 시까지 보관될 수 있습니다.',
            '구체적인 데이터 저장 국가는 운영 중인 Supabase 프로젝트 및 Vercel 인프라 설정에 따릅니다. 국외 처리 방식에 중대한 변경이 생기면 사전에 안내합니다.',
          ],
        },
        {
          title: '6. 이용자의 권리와 행사 방법',
          body: [
            '이용자는 자신의 개인정보에 대해 열람, 정정, 삭제, 처리정지 및 회원 탈퇴를 요청할 수 있습니다.',
            '요청은 아래 문의처로 접수할 수 있으며, 본인 확인 후 관련 법령이 정한 절차에 따라 처리합니다.',
          ],
        },
        {
          title: '7. 개인정보의 파기',
          body: [
            '보유 기간이 끝나거나 처리 목적이 달성된 개인정보는 복구 또는 재생되지 않도록 삭제합니다. 전자 파일은 기술적으로 안전한 방법으로 삭제합니다.',
          ],
        },
        {
          title: '8. 안전성 확보 조치',
          body: [
            '전송 구간 암호화, 인증 토큰 보호, 데이터베이스 접근 통제와 사용자별 행 수준 보안(RLS) 등 합리적인 기술적·관리적 보호조치를 적용합니다.',
          ],
        },
        {
          title: '9. 로컬 저장소 및 자동 수집 장치',
          body: [
            '로그인 상태, 언어·테마 설정 및 오프라인 메모를 저장하기 위해 브라우저의 localStorage, sessionStorage 및 IndexedDB를 사용합니다.',
            '이용자는 브라우저 설정에서 저장 데이터를 삭제할 수 있으나, 이 경우 자동 로그인과 오프라인 기능이 제한될 수 있습니다.',
          ],
        },
        {
          title: '10. 개인정보 보호 문의',
          body: [
            '개인정보 관련 문의, 불만 처리 및 권리 행사는 아래 이메일로 요청할 수 있습니다.',
          ],
        },
        {
          title: '11. 처리방침의 변경',
          body: [
            '이 방침이 변경되는 경우 시행일 전에 서비스 화면 또는 웹사이트를 통해 알립니다. 이용자의 권리에 중대한 변경이 있는 경우 충분한 기간을 두고 안내합니다.',
          ],
        },
      ],
    },
    terms: {
      intro:
        '이 약관은 AnyMemo 운영자(이하 “운영자”)가 제공하는 AnyMemo 서비스의 이용 조건과 운영자 및 이용자의 권리·의무를 정합니다.',
      sections: [
        {
          title: '1. 약관의 적용과 변경',
          body: [
            '이용자가 회원가입을 완료하거나 서비스를 이용하면 이 약관에 동의한 것으로 봅니다.',
            '운영자는 관련 법령을 위반하지 않는 범위에서 약관을 변경할 수 있으며, 변경 내용과 시행일을 서비스 화면에 미리 알립니다.',
          ],
        },
        {
          title: '2. 계정',
          body: [
            '이용자는 정확하고 이용 가능한 이메일 주소로 계정을 만들고, 자신의 로그인 정보를 안전하게 관리해야 합니다.',
            '계정의 무단 사용을 알게 된 경우 즉시 운영자에게 알려야 합니다. 타인의 계정을 사용하거나 계정을 양도해서는 안 됩니다.',
            '만 14세 미만은 법정대리인의 동의 없이 가입할 수 없습니다.',
          ],
        },
        {
          title: '3. 서비스 제공',
          body: [
            'AnyMemo는 메모 작성, 기기 저장 및 서버 동기화 기능을 제공합니다.',
            '점검, 장애, 외부 서비스 변경 또는 불가피한 운영상 사유로 서비스의 일부가 일시 중단되거나 변경될 수 있습니다.',
          ],
        },
        {
          title: '4. 이용자 콘텐츠',
          body: [
            '이용자가 작성한 메모의 권리는 이용자에게 있습니다. 운영자는 서비스 제공, 동기화 및 백업에 필요한 범위에서만 해당 콘텐츠를 처리합니다.',
            '이용자는 불법 정보, 타인의 권리를 침해하는 정보, 악성 코드 등 관련 법령이나 공공질서에 위반되는 콘텐츠를 저장해서는 안 됩니다.',
          ],
        },
        {
          title: '5. 금지 행위',
          body: [
            '서비스 또는 다른 이용자의 정상적인 이용을 방해하는 행위',
            '서비스의 보안 기능을 우회하거나 허가 없이 시스템에 접근하는 행위',
            '자동화 수단으로 과도한 부하를 발생시키거나 서비스를 악용하는 행위',
            '관련 법령 또는 이 약관을 위반하는 행위',
          ],
        },
        {
          title: '6. 데이터 보관과 백업',
          body: [
            '운영자는 안정적인 동기화를 위해 노력하지만, 이용자는 중요한 메모를 내보내기 기능 등으로 별도 보관할 책임이 있습니다.',
            '회원 탈퇴 또는 영구 삭제한 데이터는 복구되지 않을 수 있습니다.',
          ],
        },
        {
          title: '7. 이용 제한 및 계약 종료',
          body: [
            '이용자는 언제든지 회원 탈퇴를 요청할 수 있습니다.',
            '운영자는 이용자가 법령이나 약관을 중대하게 위반하거나 서비스 보안을 위협하는 경우 사전 통지 후 이용을 제한할 수 있습니다. 긴급한 보안 사유가 있으면 먼저 제한한 뒤 알릴 수 있습니다.',
          ],
        },
        {
          title: '8. 책임의 제한',
          body: [
            '운영자는 고의 또는 중대한 과실이 없는 한 천재지변, 통신망 장애, 이용자의 기기 문제 또는 외부 서비스 장애로 발생한 손해에 책임을 지지 않습니다.',
            '이 조항은 관련 법령에 따라 운영자의 책임을 배제할 수 없는 경우에는 적용되지 않습니다.',
          ],
        },
        {
          title: '9. 준거법 및 분쟁 해결',
          body: [
            '이 약관은 대한민국 법률에 따릅니다. 분쟁이 발생하면 당사자 간 협의를 우선하며, 해결되지 않는 경우 관련 법령이 정한 관할 법원에서 해결합니다.',
          ],
        },
        {
          title: '10. 문의',
          body: ['서비스 및 약관에 관한 문의는 아래 이메일로 접수할 수 있습니다.'],
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
        'The operator of AnyMemo (“we”) processes personal information as described below and in accordance with applicable privacy laws.',
      sections: [
        {
          title: '1. Information we process and why',
          body: [
            'Account and authentication: email address, password authentication data, and user identifier.',
            'Google sign-in: email address, Google account identifier, and basic profile information supplied by Google.',
            'Service data: memo titles and bodies, pin and sort data, and creation, update, and deletion timestamps.',
            'Security data: access logs, IP address, browser or device information, and error logs may be generated automatically.',
            'We use this information to authenticate accounts, sync and recover memos, respond to requests, prevent abuse, and keep the service reliable.',
          ],
        },
        {
          title: '2. Legal basis',
          body: [
            'We process information required for account authentication and memo synchronization to enter into and perform our service contract with you.',
            'If we add optional processing that requires consent, we will provide a separate, clear choice.',
          ],
        },
        {
          title: '3. Retention',
          body: [
            'Account and memo data is kept until account deletion, then deleted without undue delay unless retention is required by law.',
            'Memos in Trash are automatically deleted after 7 days and can be permanently deleted sooner.',
            'Offline cache and sign-in data stored on your device are removed when you clear the app or browser storage.',
          ],
        },
        {
          title: '4. Service providers',
          body: [
            'Supabase, Inc.: authentication, database, and real-time synchronization.',
            'Vercel Inc.: web hosting and delivery.',
            'Google LLC: authentication when you choose Google sign-in.',
            'We share information only as needed to provide these functions and will update this policy if providers or processing materially change.',
          ],
        },
        {
          title: '5. International processing',
          body: [
            'Our service providers may process information outside your country. Transfers occur over encrypted networks when you use the service, and data may be kept until account deletion or termination of the relevant provider agreement.',
            'The specific storage country depends on the active Supabase project region and Vercel infrastructure settings. We will provide advance notice of material changes.',
          ],
        },
        {
          title: '6. Your rights',
          body: [
            'You may request access, correction, deletion, restriction of processing, or account deletion.',
            'Submit a request using the contact address below. We may verify your identity before responding as required by law.',
          ],
        },
        {
          title: '7. Deletion',
          body: [
            'When information is no longer required, we delete it using methods designed to prevent recovery or reproduction.',
          ],
        },
        {
          title: '8. Security',
          body: [
            'We apply reasonable safeguards including encrypted transport, authentication-token protection, database access controls, and per-user row-level security.',
          ],
        },
        {
          title: '9. Device storage',
          body: [
            'We use localStorage, sessionStorage, and IndexedDB for sign-in state, language and theme preferences, and offline memos.',
            'You can clear this data in your browser settings, but automatic sign-in and offline features may stop working.',
          ],
        },
        {
          title: '10. Privacy contact',
          body: [
            'Use the email below for privacy questions, complaints, and rights requests.',
          ],
        },
        {
          title: '11. Changes',
          body: [
            'We will announce policy changes through the service or website before they take effect, with additional notice for material changes affecting your rights.',
          ],
        },
      ],
    },
    terms: {
      intro:
        'These Terms govern your use of AnyMemo and set out the rights and responsibilities of you and the operator of AnyMemo (“we”).',
      sections: [
        {
          title: '1. Acceptance and changes',
          body: [
            'By completing registration or using the service, you agree to these Terms.',
            'We may change these Terms where permitted by law and will announce the changes and effective date in advance.',
          ],
        },
        {
          title: '2. Accounts',
          body: [
            'Use an accurate, accessible email address and keep your credentials secure.',
            'Notify us promptly of unauthorized use. You may not use or transfer another person’s account.',
            'Users under 14 may not register without consent from a legal guardian.',
          ],
        },
        {
          title: '3. Service',
          body: [
            'AnyMemo provides memo editing, local storage, and server synchronization.',
            'Features may be temporarily unavailable or changed due to maintenance, failures, provider changes, or operational necessity.',
          ],
        },
        {
          title: '4. Your content',
          body: [
            'You retain rights in your memos. We process them only as needed to provide synchronization, backup, and the service.',
            'Do not store unlawful content, content that infringes others’ rights, malware, or content contrary to public order.',
          ],
        },
        {
          title: '5. Prohibited conduct',
          body: [
            'Disrupting the service or another user’s normal use.',
            'Bypassing security or accessing systems without authorization.',
            'Creating excessive load through automation or abusing the service.',
            'Violating applicable law or these Terms.',
          ],
        },
        {
          title: '6. Data and backups',
          body: [
            'We work to provide reliable sync, but you are responsible for keeping separate copies of important memos using export or another method.',
            'Data deleted through account deletion or permanent deletion may not be recoverable.',
          ],
        },
        {
          title: '7. Suspension and termination',
          body: [
            'You may request account deletion at any time.',
            'We may restrict access after notice for a material violation or security threat. For urgent security reasons, we may restrict access first and notify you afterward.',
          ],
        },
        {
          title: '8. Limitation of liability',
          body: [
            'Unless caused by our willful misconduct or gross negligence, we are not liable for losses caused by force majeure, network failures, your device, or third-party service outages.',
            'This limitation does not apply where liability cannot be excluded under applicable law.',
          ],
        },
        {
          title: '9. Governing law and disputes',
          body: [
            'These Terms are governed by the laws of the Republic of Korea. We will first try to resolve disputes by discussion; unresolved disputes will be handled by the court with jurisdiction under applicable law.',
          ],
        },
        {
          title: '10. Contact',
          body: ['Send service or Terms questions to the email below.'],
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
