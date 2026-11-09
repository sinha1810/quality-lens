# QualityLens report

Source: `report.json`

## Run health: HEALTHY

| Metric | Value |
| --- | ---: |
| Total tests | 2 |
| Passed | 2 |
| Failed | 0 |
| Timed out | 0 |
| Skipped | 0 |
| Flaky passes | 1 |
| Average duration | 9.10s |
| P95 duration | 17.00s |

## Insights

- 1 test passed only after a retry; investigate for flakiness.
- The slowest test took 17.0s; consider tracing its setup and network waits.

## Slowest tests

| Test | Status | Duration | Retries |
| --- | --- | ---: | ---: |
| checkout › recovers from a payment timeout | passed | 17.00s | 1 |
| checkout › completes a purchase | passed | 1.20s | 0 |

## Failures

No failures recorded.
