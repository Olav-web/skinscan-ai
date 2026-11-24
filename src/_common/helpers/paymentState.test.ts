import { afterEach, expect, it, vi } from 'vitest';
import { effectScope, nextTick } from 'vue';
import { paymentWarning, useHostingGraceClock } from './paymentState';
import { planStatus } from '@/_dashboard/utils/billing.js';
afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
});
it('keeps an unknown final cancellation date explicit instead of guessing from a renewal', () => {
    expect(paymentWarning({ status: 'past_due', attempts: 1 })?.description).toContain(
        'final cancellation date is not yet available'
    );
});
it('uses the confirmed next attempt without presenting it as the plan end date', () => {
    const state = { status: 'past_due' as const, nextAttemptAt: '2026-11-12T15:00:00Z' };
    expect(paymentWarning(state)?.description).toContain('next payment attempt');
    expect(planStatus({ paymentState: state, nextCycleDate: 1 })).toMatchObject({
        verb: 'Next attempt',
        date: state.nextAttemptAt,
    });
});
it('describes ongoing hosting grace after the workspace plan ended', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-10T00:00:00Z'));
    const state = {
        status: 'canceled' as const,
        finalFailureAt: '2026-11-09T12:00:00Z',
        hostingGraceEndsAt: '2026-11-16T12:00:00Z',
    };
    expect(paymentWarning(state)?.title).toContain('ended after a failed payment');
    expect(paymentWarning(state)?.description).toContain('remain available until');
    expect(planStatus({ paymentState: state, nextCycleDate: 1 })).toMatchObject({
        verb: 'Ended',
        date: state.finalFailureAt,
    });
});
it('ends the banner and billing card warning at the grace deadline', () => {
    vi.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-20T00:00:00Z'));
    const state = { status: 'canceled' as const, hostingGraceEndsAt: '2026-11-20T00:00:00Z' };
    expect(paymentWarning(state)).toBeNull();
    expect(planStatus({ paymentState: state }).tag).toBeNull();
});
it('updates a mounted warning at expiry without a refresh', async () => {
    vi.useFakeTimers();
    const deadline = '2026-11-20T00:00:00Z';
    vi.setSystemTime(Date.parse(deadline) - 1_000);
    const state = { status: 'canceled' as const, hostingGraceEndsAt: deadline };
    const scope = effectScope();
    try {
        const now = scope.run(() => useHostingGraceClock(() => state))!;
        expect(paymentWarning(state, now.value)).not.toBeNull();
        vi.advanceTimersByTime(1_000);
        await nextTick();
        expect(paymentWarning(state, now.value)).toBeNull();
    } finally {
        scope.stop();
    }
});
it('keeps normal subscription renewal and voluntary cancellation copy', () => {
    expect(paymentWarning(null)).toBeNull();
    expect(planStatus({})).toEqual({ pending: false, tag: null, verb: 'Renews' });
    expect(planStatus({ isCancelled: true })).toEqual({
        pending: true,
        tag: 'Cancellation scheduled',
        verb: 'Cancels',
    });
});

it.each([
    { status: 'past_due' as const, compact: false },
    { status: 'past_due' as const, compact: true },
    { status: 'canceled' as const, compact: false },
    { status: 'canceled' as const, compact: true },
])('qualifies the MCP entitlement for $status with compact=$compact', ({ status, compact }) => {
    const state = { status, hostingGraceEndsAt: new Date(Date.now() + 86_400_000).toISOString() };
    expect(paymentWarning(state, Date.now(), { compact })?.description).toContain('MCP access included in');
});
