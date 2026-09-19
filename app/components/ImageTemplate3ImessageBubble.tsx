'use client';

import { useMemo } from 'react';
import {
  IMAGE_TEMPLATE3_IMESSAGE_ACCENT,
  IMAGE_TEMPLATE3_IMESSAGE_AVATAR_BG,
  IMAGE_TEMPLATE3_IMESSAGE_BG,
  IMAGE_TEMPLATE3_IMESSAGE_BUBBLE,
  IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON,
  IMAGE_TEMPLATE3_IMESSAGE_CONTACT_NAME,
  IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
  IMAGE_TEMPLATE3_IMESSAGE_HEADER,
  IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE,
  IMAGE_TEMPLATE3_IMESSAGE_INPUT_BORDER,
  IMAGE_TEMPLATE3_IMESSAGE_SEPARATOR,
  IMAGE_TEMPLATE3_IMESSAGE_STATUS_TIME,
  IMAGE_TEMPLATE3_IMESSAGE_TEXT,
  pickImessageContextThread,
  type ImessageContextLine,
} from '@/app/lib/image-template-3-imessage';

type ImageTemplate3ImessageBubbleProps = {
  question: string;
  replies?: string[] | null;
  /** Shown under the outgoing bubble. */
  deliveryStatus?: 'Delivered' | 'Read';
  replyLoading?: boolean;
};

/** Status bar: time plus signal, wifi and battery glyphs. */
function StatusBar() {
  return (
    <div
      className="flex shrink-0 items-center justify-between px-[8%] pt-[1.6%] pb-[0.6%]"
      style={{
        color: IMAGE_TEMPLATE3_IMESSAGE_TEXT,
        fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
      }}
    >
      <span className="text-[10px] font-semibold sm:text-[12px]">
        {IMAGE_TEMPLATE3_IMESSAGE_STATUS_TIME}
      </span>
      <div className="flex items-center gap-0.75">
        <svg viewBox="0 0 18 12" aria-hidden className="h-2.25 w-3.25 fill-current">
          <rect x="0" y="8" width="3" height="4" rx="1" />
          <rect x="4.5" y="6" width="3" height="6" rx="1" />
          <rect x="9" y="3.5" width="3" height="8.5" rx="1" />
          <rect x="13.5" y="1" width="3" height="11" rx="1" />
        </svg>
        <svg viewBox="0 0 16 12" aria-hidden className="h-2.25 w-3">
          <g fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M1.4 4.2a9.5 9.5 0 0 1 13.2 0" />
            <path d="M3.9 6.9a6 6 0 0 1 8.2 0" />
          </g>
          <circle cx="8" cy="9.8" r="1.1" fill="currentColor" />
        </svg>
        <svg viewBox="0 0 26 12" aria-hidden className="h-2.25 w-4.75">
          <rect
            x="0.7"
            y="0.7"
            width="21"
            height="10.6"
            rx="3.2"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.45"
            strokeWidth="1.2"
          />
          <rect x="2.4" y="2.4" width="13" height="7.2" rx="2" fill="currentColor" />
          <path
            d="M23.4 4.2v3.6a2 2 0 0 0 0-3.6Z"
            fill="currentColor"
            fillOpacity="0.5"
          />
        </svg>
      </div>
    </div>
  );
}

/** Back chevron, avatar and contact name. */
function ConversationHeader() {
  return (
    <div
      className="relative shrink-0 pb-[2.5%] pt-[1%]"
      style={{ borderBottom: `1px solid ${IMAGE_TEMPLATE3_IMESSAGE_SEPARATOR}` }}
    >
      <svg
        viewBox="0 0 12 20"
        aria-hidden
        className="absolute left-[5.5%] top-1/2 h-4 w-2.5 -translate-y-[70%]"
        fill="none"
        stroke={IMAGE_TEMPLATE3_IMESSAGE_ACCENT}
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9.5 2.5 2.5 10l7 7.5" />
      </svg>
      <div className="flex flex-col items-center gap-0.75">
        <div
          className="relative h-8.5 w-8.5 overflow-hidden rounded-full sm:h-10 sm:w-10"
          style={{ backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_AVATAR_BG }}
        >
          <div className="absolute left-1/2 top-[22%] h-[36%] w-[36%] -translate-x-1/2 rounded-full bg-[#C7C7CC]" />
          <div className="absolute left-1/2 top-[64%] h-[52%] w-[62%] -translate-x-1/2 rounded-t-full bg-[#C7C7CC]" />
        </div>
        <span
          className="text-[11px] sm:text-[13px]"
          style={{
            color: IMAGE_TEMPLATE3_IMESSAGE_TEXT,
            fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
          }}
        >
          {IMAGE_TEMPLATE3_IMESSAGE_CONTACT_NAME}
        </span>
      </div>
    </div>
  );
}

/** Plus button, empty iMessage field, mic, home indicator. */
function InputBar() {
  return (
    <div className="shrink-0 px-[5%] pb-[3%] pt-[2%]">
      <div className="flex items-center gap-[3.5%]">
        <div
          className="flex h-6.5 w-6.5 shrink-0 items-center justify-center rounded-full sm:h-7.5 sm:w-7.5"
          style={{ backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_INPUT_BORDER }}
        >
          <svg viewBox="0 0 14 14" aria-hidden className="h-3.25 w-3.25">
            <g stroke="#AEAEB2" strokeWidth="1.8" strokeLinecap="round">
              <path d="M7 3v8M3 7h8" />
            </g>
          </svg>
        </div>
        <div
          className="flex h-6.5 flex-1 items-center justify-between rounded-full px-[3.5%] sm:h-7.5"
          style={{ border: `1px solid ${IMAGE_TEMPLATE3_IMESSAGE_INPUT_BORDER}` }}
        >
          <span
            className="text-[10px] sm:text-[12px]"
            style={{
              color: IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON,
              fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
            }}
          >
            iMessage
          </span>
          <svg
            viewBox="0 0 12 18"
            aria-hidden
            className="h-3.5 w-2.25"
            fill="none"
            stroke={IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON}
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <rect x="4" y="1.5" width="4" height="8" rx="2" fill={IMAGE_TEMPLATE3_IMESSAGE_CHROME_ICON} stroke="none" />
            <path d="M2 8.5a4 4 0 0 0 8 0M6 12.5v2.5" />
          </svg>
        </div>
      </div>
      <div className="mx-auto mt-[3%] h-0.75 w-[34%] rounded-full bg-[#48484A]" />
    </div>
  );
}

const BUBBLE_TEXT_CLASS =
  'rounded-[1.15em] px-[0.95em] py-[0.65em] text-[12px] sm:text-[14px] md:text-[15px] leading-[1.28] wrap-break-word';

function ContextBubbleRow({ line }: { line: ImessageContextLine }) {
  return (
    <div className={`flex ${line.outgoing ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`${BUBBLE_TEXT_CLASS} relative max-w-[72%] ${
          line.outgoing ? 'imessage-tail-out' : 'imessage-tail-in'
        }`}
        style={{
          backgroundColor: line.outgoing
            ? IMAGE_TEMPLATE3_IMESSAGE_BUBBLE
            : IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE,
          color: IMAGE_TEMPLATE3_IMESSAGE_TEXT,
          fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
        }}
      >
        {line.text}
      </div>
    </div>
  );
}

type MessagesScreenProps = ImageTemplate3ImessageBubbleProps & {
  /** Both layers render the same tree so the sharp copy lands exactly on its hole. */
  mode: 'backdrop' | 'focus';
  before: ImessageContextLine[];
  after: ImessageContextLine[];
};

function MessagesScreen({
  question,
  replies,
  deliveryStatus = 'Delivered',
  replyLoading = false,
  mode,
  before,
  after,
}: MessagesScreenProps) {
  const text = question.trim();
  const replyList = (replies ?? []).map((r) => r.trim()).filter(Boolean);
  const isFocusLayer = mode === 'focus';
  const chromeClass = isFocusLayer ? 'invisible' : '';
  const focusClass = isFocusLayer ? '' : 'invisible';

  return (
    <div
      className="absolute inset-0 flex flex-col"
      style={{
        backgroundColor: isFocusLayer ? 'transparent' : IMAGE_TEMPLATE3_IMESSAGE_BG,
      }}
    >
      <div className={chromeClass}>
        <StatusBar />
        <ConversationHeader />
      </div>
      {/* Center the focused exchange so blurred messages sit above and below. */}
      <div className="flex flex-1 flex-col justify-center gap-2 overflow-hidden px-[6%] py-[3%]">
        <div className={`${chromeClass} flex flex-col gap-1.5`}>
          {before.map((line) => (
            <ContextBubbleRow key={`b-${line.text}-${line.outgoing}`} line={line} />
          ))}
          <p
            className="py-0.5 text-center text-[9px] sm:text-[11px]"
            style={{
              color: IMAGE_TEMPLATE3_IMESSAGE_HEADER,
              fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
            }}
          >
            <span className="font-semibold">Today</span>{' '}
            {IMAGE_TEMPLATE3_IMESSAGE_STATUS_TIME} PM
          </p>
        </div>
        <div className={`${focusClass} flex flex-col gap-2`}>
          {text ? (
            <div className="flex flex-col items-end gap-1">
              <div
                className={`${BUBBLE_TEXT_CLASS} relative max-w-[72%] imessage-tail-out`}
                style={{
                  backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_BUBBLE,
                  color: IMAGE_TEMPLATE3_IMESSAGE_TEXT,
                  fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
                }}
              >
                {text}
              </div>
              <span
                className="pr-0.5 text-[10px] sm:text-[11px]"
                style={{
                  color: IMAGE_TEMPLATE3_IMESSAGE_HEADER,
                  fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
                }}
              >
                {deliveryStatus}
              </span>
            </div>
          ) : null}

          {replyLoading ? (
            <div className="flex justify-start">
              <div
                className="rounded-[1.15em] px-[0.95em] py-[0.65em] text-[12px] sm:text-[13px]"
                style={{
                  backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE,
                  color: IMAGE_TEMPLATE3_IMESSAGE_HEADER,
                  fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
                }}
              >
                …
              </div>
            </div>
          ) : (
            replyList.map((replyText, i) => {
              const isLast = i === replyList.length - 1;
              return (
                <div key={`${i}-${replyText.slice(0, 24)}`} className="flex justify-start">
                  <div
                    className={`${BUBBLE_TEXT_CLASS} relative max-w-[72%] ${
                      isLast ? 'imessage-tail-in' : ''
                    }`}
                    style={{
                      backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE,
                      color: IMAGE_TEMPLATE3_IMESSAGE_TEXT,
                      fontFamily: IMAGE_TEMPLATE3_IMESSAGE_FONT_STACK,
                    }}
                  >
                    {replyText}
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className={`${chromeClass} flex flex-col gap-1.5`}>
          {after.map((line) => (
            <ContextBubbleRow key={`a-${line.text}-${line.outgoing}`} line={line} />
          ))}
        </div>
      </div>
      <div className={chromeClass}>
        <InputBar />
      </div>
    </div>
  );
}

/**
 * Preview: iPhone Messages screen with the current exchange in focus and the rest
 * of the thread blurred behind a scrim, like an inline reply in Messages.
 */
export function ImageTemplate3ImessageBubble(props: ImageTemplate3ImessageBubbleProps) {
  const thread = useMemo(() => {
    const replies = (props.replies ?? []).join('|');
    return pickImessageContextThread(
      `${props.question}|${replies}|${props.deliveryStatus ?? 'Delivered'}`
    );
  }, [props.question, props.replies, props.deliveryStatus]);

  return (
    <div
      className="absolute inset-0 z-10 overflow-hidden"
      style={{ backgroundColor: IMAGE_TEMPLATE3_IMESSAGE_BG }}
    >
      <style>{`
        .imessage-tail-out,
        .imessage-tail-in {
          position: relative;
        }
        .imessage-tail-out::before,
        .imessage-tail-out::after,
        .imessage-tail-in::before,
        .imessage-tail-in::after {
          content: '';
          position: absolute;
          bottom: 0;
          width: 20px;
          height: 25px;
          pointer-events: none;
        }
        .imessage-tail-out::before {
          right: -7px;
          background: ${IMAGE_TEMPLATE3_IMESSAGE_BUBBLE};
          border-bottom-left-radius: 16px 14px;
        }
        .imessage-tail-out::after {
          right: -26px;
          width: 26px;
          background: ${IMAGE_TEMPLATE3_IMESSAGE_BG};
          border-bottom-left-radius: 10px;
        }
        .imessage-tail-in::before {
          left: -7px;
          background: ${IMAGE_TEMPLATE3_IMESSAGE_INCOMING_BUBBLE};
          border-bottom-right-radius: 16px 14px;
        }
        .imessage-tail-in::after {
          left: -26px;
          width: 26px;
          background: ${IMAGE_TEMPLATE3_IMESSAGE_BG};
          border-bottom-right-radius: 10px;
        }
      `}</style>
      <div className="absolute inset-0 blur-[3px] sm:blur-[5px]">
        <MessagesScreen {...props} mode="backdrop" before={thread.before} after={thread.after} />
      </div>
      <div className="absolute inset-0 bg-black/55" />
      <MessagesScreen {...props} mode="focus" before={thread.before} after={thread.after} />
    </div>
  );
}
