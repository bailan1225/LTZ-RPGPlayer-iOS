import Foundation

/// 崩溃日志：Objective-C 异常与常见信号写 Documents/crash.log，便于真机排障
enum CrashReporter {

    static var logURL: URL {
        FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("crash.log")
    }

    static func install() {
        NSSetUncaughtExceptionHandler { exc in
            let stack = exc.callStackSymbols.prefix(30).joined(separator: "\n")
            let msg = "[NSException \(Date())] \(exc.name.rawValue): \(exc.reason ?? "nil")\n\(stack)\n"
            try? msg.write(to: CrashReporter.logURL, atomically: true, encoding: .utf8)
        }
        signal(SIGABRT) { sig in CrashReporter.writeSignal(sig) }
        signal(SIGSEGV) { sig in CrashReporter.writeSignal(sig) }
        signal(SIGBUS) { sig in CrashReporter.writeSignal(sig) }
        signal(SIGTRAP) { sig in CrashReporter.writeSignal(sig) }
    }

    private static func writeSignal(_ sig: Int32) {
        let msg = "[SIGNAL \(sig) \(Date())] app crashed\n"
        try? msg.write(to: logURL, atomically: true, encoding: .utf8)
    }
}
