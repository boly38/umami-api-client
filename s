[33mcommit 63dd880ad49900c633bb974b86473adc1a21c663[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mv303[m[33m, [m[1;31morigin/v303[m[33m)[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Thu Jan 22 19:58:52 2026 +0100

    GHA audit

[33mcommit 12a4069c47e4448c9609b9635d47e960505358b6[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Thu Jan 22 18:33:05 2026 +0100

    feat(tests): split hosted/cloud tests + add env templates
    
    - Separate hosted vs cloud tests for Links & Pixels API
    - Add cloud test env templates
    - Centralize env detection in helpers/env.js

[33mcommit fcbee8c82b6cf38e4215dcfbf594e285f584e409[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Thu Jan 22 15:12:15 2026 +0100

    feat(v3): add Pixels API and finalize v3.0.3 release
    
    - Add Pixels API (read-only): pixels(), getPixel(), pixelStats()
    - Add tests/50_pixels_api.test.js (12 passing)
    - Fix tests opt-out pattern (run by default)
    - Update documentation (README, CHANGELOG, issue)
    - Cleanup: remove v3.1.0 references, simplify issue tracking
    - Clarify scope: Segments/Cohorts/Admin not implemented
    
    Related: Issue #43

[33mcommit a1fa64e727f7715ffabe3a3d3e29a44e7a3addda[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Wed Jan 21 08:34:02 2026 +0100

    feat(links): implement Links API read-only support
    
    Add read-only support for Umami v3 Links API (short URLs tracking):
    - links(options) - List short URLs with pagination/search
    - getLink(linkId) - Get link details
    - linkStats(linkId, period, options) - Get link stats (alias for websiteStats)
    
    Fixed: API parameter 'query' → 'search' per Umami spec
    
    Tests: 40_links_api.test.js, manual scripts with stats comparison tables
    Docs: README.md, agent.md, TestsReadme.md updated
    
    Related: Issue #43

[33mcommit e7e7f4fdcaa13e9f88a47fa8266005a43834c6d4[m[33m ([m[1;31morigin/main[m[33m, [m[1;31morigin/HEAD[m[33m, [m[1;32mmain[m[33m)[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Mon Jan 19 20:52:44 2026 +0100

    chore: update GitHub Actions to latest versions
    
    - actions/checkout: v4 → v6.0.1 (major)
    - actions/setup-node: v4 → v6.2.0 (major)
    - pnpm/action-setup: v4 → v4.2.0 (patch)
    - peaceiris/actions-gh-pages: v4.0.0 (already up to date)
    
    All workflows updated: main, 00_pnpm_audit, patch, minor

[33mcommit 0c29740f9f988f82a713e88c9f78af46c3b6fd75[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Mon Jan 19 20:46:42 2026 +0100

    chore: update dependencies and bump to v3.0.3
    
    Dependencies:
    - query-string: 9.1.1 → 9.3.1
    - winston: 3.17.0 → 3.19.0
    - mocha: 11.1.0 → 11.7.5
    - chai: 5.2.0 → 6.2.2 (major: bundling only, no API changes)
    
    Tools:
    - pnpm: 10.7.0 → 10.28.1 (via corepack)
    
    Security:
    - Fixed 2 CVE via pnpm overrides (glob, diff)
    - 0 known vulnerabilities
    
    Version:
    - Bumped to v3.0.3 (Umami v3 API support)
    
    All tests passing : 31 passing (13s)

[33mcommit 82216570f2c601255ed62105e833fbb2f93760a0[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Mon Jan 19 20:29:39 2026 +0100

    feat: Umami v3 API support - Phase 1 (compatibility) (#43)
    
    BREAKING CHANGE: This version targets Umami v3.x API only. Not compatible with Umami v2.x.
    
    - Updated websiteMetrics(): Changed default type from 'url' to 'path' (Umami v3 renamed this metric type)
    - Removed deprecated v2 methods: getSites(), getStats(), getPageViews(), getEvents(), getMetrics(), verify()
    - API responses now match Umami v3 format (direct values in websiteStats, wrapped pageviews)
    
    - Added MIGRATION_V3.md: Complete v2→v3 migration guide with breaking changes
    - Added CHANGELOG.md: Version history following Keep a Changelog format
    - Updated README.md: Version notice table, link to migration guide
    - Created .github/issue_umami_v3_support.md: Tracking v3 implementation progress
    - Created .github/breaking_changes_v3.md: Detailed API changes analysis
    - Updated agent.md: v3 version, DRY/SRP principles for documentation
    
    - Updated test suite for v3 compatibility (11/11 passing)
    - Changed 'url' → 'path' in all tests (20_hosted, 30_cloud)
    - Updated login error test for v3 error response format
    - Added manual v3 tests:
      - test_v3_cloud_auth.js
      - test_v3_cloud_endpoints.js
      - test_v3_metrics_path_vs_url.js (validation test)
      - test_v3_hosted_metrics_24h.js
    
    - Updated env templates with UMAMI_TEST_* variables
    - Added initenv_host_test.template.sh for test environments
    
    Users on Umami v2.x: Stay on umami-api-client@2.17.3
    Users on Umami v3.x: Upgrade to umami-api-client@3.0.3
    
    See MIGRATION_V3.md for complete upgrade instructions.
    
    21 files changed, 2121 insertions(+), 178 deletions(-)
    
    Related: #43

[33mcommit d828e2db5801579264745336034786440b3e4c20[m
Author: dependabot[bot] <49699333+dependabot[bot]@users.noreply.github.com>
Date:   Wed Jun 11 22:12:17 2025 +0000

    Bump brace-expansion in the npm_and_yarn group across 1 directory
    
    Bumps the npm_and_yarn group with 1 update in the / directory: [brace-expansion](https://github.com/juliangruber/brace-expansion).
    
    
    Updates `brace-expansion` from 2.0.1 to 2.0.2
    - [Release notes](https://github.com/juliangruber/brace-expansion/releases)
    - [Commits](https://github.com/juliangruber/brace-expansion/compare/v2.0.1...v2.0.2)
    
    ---
    updated-dependencies:
    - dependency-name: brace-expansion
      dependency-version: 2.0.2
      dependency-type: indirect
      dependency-group: npm_and_yarn
    ...
    
    Signed-off-by: dependabot[bot] <support@github.com>

[33mcommit d133e6e58ab144e3cf36d57362054a63ef837b31[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Mon Jan 19 17:09:44 2026 +0100

    feat #44: add LLM agent development context
    
    - agent.md: compact project context (70 lines, -55% tokens)
    - .github/agent.md: workflow guidelines
    - .continue/rules: test execution patterns
    - .continue/mcpServers: MCP config
    
    Optimized for LLM token efficiency.

[33mcommit 2cdaac76f4ea0e009b1359879d838747b230ff35[m[33m ([m[1;33mtag: [m[1;33mv2.17.3[m[33m, [m[1;31morigin/npmjs[m[33m)[m
Author: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
Date:   Sun Apr 6 17:56:44 2025 +0000

    2.17.3

[33mcommit dea665fbf66a7ee23218cbe74daed01784a11d37[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Apr 6 16:02:41 2025 +0200

    update query-string

[33mcommit c3dfe58b2b902a7c86eab852643aef2d47363fd3[m[33m ([m[1;33mtag: [m[1;33mv2.17.2[m[33m)[m
Author: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
Date:   Sun Apr 6 13:56:26 2025 +0000

    2.17.2

[33mcommit 41d9713a4e70e8fd167e541f7b5104b5f9dd88c3[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Apr 6 15:54:37 2025 +0200

    fix #36  main for main

[33mcommit d41b82bff60e10e3c0996009e72f31a200aeb625[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Apr 6 15:52:52 2025 +0200

    pnpm audit - warn on outdated dep

[33mcommit e32fd384bda1d1f145b364986eb434a4b46bfbbc[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Apr 6 15:46:20 2025 +0200

    Fix #36 publish coverage on main push

[33mcommit c9825379d41e2c63fa737a7ea431f4972d2b426b[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Apr 6 15:42:49 2025 +0200

    Fix #37 add get sessions

[33mcommit 8483a5c04aa67a32f9e60983d2fabd88108fa826[m[33m ([m[1;33mtag: [m[1;33mv2.17.1[m[33m)[m
Author: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
Date:   Sat Apr 5 18:35:31 2025 +0000

    2.17.1

[33mcommit aa93bbbcb45849028158670314f359528f507d82[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Mon Mar 31 21:14:26 2025 +0200

    Fix #34 support umami cloud and cloudApiKey
    
    - improve client
    - input validation
    - update test, readme, gh pages
    
    CR Copilot

[33mcommit 4b0045605ac9f7342c6d71578e147c4efbc05aa0[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Mar 30 14:44:02 2025 +0200

    Fix #31 - dont add gren as dev dep to avoid security report

[33mcommit 1efac63ff34cba948e378609e556bdf160c195d4[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Mar 30 14:17:08 2025 +0200

    add gren

[33mcommit 2d3288ab914ba3149a6bf054ff1a163a3e3f561e[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Mar 30 14:08:48 2025 +0200

    update mocha

[33mcommit c414966e5231845f2b3a68a197e651ad9866501e[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Mar 30 14:07:19 2025 +0200

    fix #28 gh pages

[33mcommit 621f1df1ca85781fefc98208f7233cce01734e88[m[33m ([m[1;33mtag: [m[1;33mv2.17.0[m[33m)[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Mar 29 20:42:27 2025 +0100

    Fix #22 tests, tz->timezone, es version

[33mcommit ce514f3e9325eb34700a49707ec7280f639f4cee[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Mar 29 21:09:57 2025 +0100

    Fix #25 - from npm to pnpm, add workflow permissions

[33mcommit da478e84d7a0c671c54de82f8e37241453445d5a[m
Author: Vandeputte Brice <brice.vandeputte@orange.com>
Date:   Sat Mar 29 20:09:10 2025 +0100

    Create dependabot.yml

[33mcommit 0194e44f099da30fdd3aa2c6acadd10951c29e57[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Mar 29 18:36:55 2025 +0100

    fix #20 - update tests/httpFiles
    
    fix boly38/action-umami-report/issues/68

[33mcommit ca7f2123b532d69ff860acf4bd96b1f258bd7e4c[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Jan 21 14:19:31 2024 +0100

    Fix #17 - add .http umami api main getters

[33mcommit 1b009284f4e425f9ebfd277bba0d68f4a2c7a59f[m[33m ([m[1;33mtag: [m[1;33mv2.0.9[m[33m)[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Jan 20 21:16:41 2024 +0100

    2.0.9

[33mcommit c80a921e61b397ac43c5601779896f1064c1c4f4[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Jan 20 21:00:08 2024 +0100

    rm susi-rali dep

[33mcommit 68851646189e347ac47b8384a61bf668d7ad9f05[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Jan 20 20:58:27 2024 +0100

    style and eslint

[33mcommit 3c1841b3249a3623915db5eeedad84ebe4e975a2[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Jan 20 17:54:55 2024 +0100

    Issue #15 - Umami update from 1.40 to 2.9.0 version

[33mcommit e95f23b746971ef807610901fbaab35a9ebe5851[m
Author: Vandeputte Brice <brice.vandeputte@orange.com>
Date:   Wed Dec 7 13:09:17 2022 +0100

    ad about jakobbouchard/umami-api-client

[33mcommit b5b80ca3b447a3ed52d5af0f5559fd0fb9f6b253[m[33m ([m[1;33mtag: [m[1;33mv0.0.4[m[33m, [m[1;33mtag: [m[1;33mumami-server-1.x[m[33m)[m
Author: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
Date:   Sat Aug 20 18:57:47 2022 +0000

    0.0.4

[33mcommit cac9d57a68f9bb90622f774943c1b0714b0ca24a[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Aug 20 20:55:30 2022 +0200

    Fix #13 audit node-fetch

[33mcommit ff0df31ec0288a632d371bc724029449ea7a6c34[m[33m ([m[1;33mtag: [m[1;33mv0.0.3[m[33m)[m
Author: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
Date:   Thu Jul 14 13:14:31 2022 +0000

    0.0.3

[33mcommit 24380bee279ff4236b10c279a4ecba13548af1a7[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Thu Jul 14 15:13:48 2022 +0200

    upd readme with periods

[33mcommit c51b8a001031f900061ca9d7514b520ce985d3f4[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Thu Jul 14 15:07:42 2022 +0200

    Fix #11 add period as input

[33mcommit 03cd2e222ef6b8dd45742e07ad1ffa2b2d47dc77[m[33m ([m[1;33mtag: [m[1;33mv0.0.2[m[33m)[m
Author: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
Date:   Sat Jul 9 18:44:24 2022 +0000

    0.0.2

[33mcommit 5a5601c653c68c87f5eb0e029ce63c2ddc74b9aa[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sat Jul 9 20:42:56 2022 +0200

    Fix #9 use hour unit

[33mcommit b6a8cc497f7b08371ce20e2adc8589aeac3e3cb8[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Fri Jul 8 21:15:48 2022 +0200

    fix README typo

[33mcommit 11c8afb50dd4948487381b5052ac7200d1d08d67[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Fri Jul 8 21:11:19 2022 +0200

    publish coverage in gh pages on new npmjs version

[33mcommit c794b3f32ee800f515210b82217ba189ba4a29d7[m[33m ([m[1;33mtag: [m[1;33mv0.0.1[m[33m)[m
Author: github-actions[bot] <github-actions[bot]@users.noreply.github.com>
Date:   Fri Jul 8 19:07:34 2022 +0000

    0.0.1

[33mcommit 86c41358e3310b82406e35ed960ec6340b19b139[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Fri Jul 8 14:12:00 2022 +0200

    Fix issue 5 - add get /pageviews /events /metrics
    
    include test

[33mcommit edcea73a39aa8980cecab7f3e58f38037556ac99[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Jul 3 16:51:35 2022 +0200

    Fix #3 add c8 config .c8rc

[33mcommit c847a373e268a724fe158f5857b655943929caa6[m[33m ([m[1;33mtag: [m[1;33mv0.0.0[m[33m)[m
Author: Brice Vandeputte <brice.vandeputte@orange.com>
Date:   Sun Jul 3 15:38:48 2022 +0200

    Fix #1 first UmamiClient client version
    
    - with tests
    - with github actions & pages coverage

[33mcommit af944bf27abfb9081e33f1961f52b86bb69af5c5[m
Author: Vandeputte Brice <boly38@gmail.com>
Date:   Sun Jul 3 15:34:36 2022 +0200

    Initial commit
