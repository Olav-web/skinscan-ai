import { ref, watchEffect } from 'vue';

export type PaymentState = {
    status: 'past_due' | 'canceled';
    attempts?: number;
    failedAt?: string | null;
    nextAttemptAt?: string | null;
    finalFailureAt?: string | null;
    hostingGraceEndsAt?: string | null;
};
function date(value?: string | null) {
    if (!value || !Number.isFinite(Date.parse(value))) return null;
    return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}
export function hostingGraceActive(state?: PaymentState | null, now = Date.now()) {
    return state?.status === 'canceled' && Date.parse(state.hostingGraceEndsAt || '') > now;
}

export function useHostingGraceClock(getState: () => PaymentState | null | undefined) {
    const now = ref(Date.now());
    watchEffect(onCleanup => {
        const state = getState();
        now.value = Date.now();
        if (state?.status !== 'canceled') return;
        const delay = Date.parse(state.hostingGraceEndsAt || '') - now.value;
        if (!(delay > 0)) return;
        const timer = setTimeout(() => (now.value = Date.now()), delay);
        onCleanup(() => clearTimeout(timer));
    });
    return now;
}

export function paymentWarning(state?: PaymentState | null, now = Date.now(), { compact = false } = {}) {
    if (!state || !['past_due', 'canceled'].includes(state.status)) return null;
    if (state.status === 'canceled') {
        if (!hostingGraceActive(state, now)) return null;
        return {
            title: 'Your workspace plan ended after a failed payment',
            description: compact
                ? `Extra seats and MCP access included in this plan have ended. Hosting and domains remain until ${date(state.hostingGraceEndsAt)}.`
                : `Extra members and MCP access included in this plan have ended. Hosting and custom domains remain available until ${date(state.hostingGraceEndsAt)}.`,
        };
    }
    const next = date(state.nextAttemptAt);
    const timing = next
        ? `The next payment attempt is scheduled for ${next}.`
        : 'Stripe uses the existing three-attempt retry policy. The final cancellation date is not yet available.';
    return {
        title: 'Payment failed for this workspace',
        description: compact
            ? `${next ? `Next attempt ${next}.` : 'Final cancellation date pending.'} Extra seats and MCP access included in the plan stop when it ends. Hosting and domains have seven more days.`
            : `${timing} Extra members and MCP access included in the plan stop when it ends. Hosting and custom domains receive seven days of grace after the final failure.`,
    };
}
