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
        log("SIGNAL \(sig) app crashed")
    }

    /// 追加一行诊断日志（供列表页「日志」按钮查看/分享）
    static func log(_ line: String) {
        let msg = "[LOG \(Date())] \(line)\n"
        var text = ""
        if let existing = try? String(contentsOf: logURL, encoding: .utf8) {
            text = existing.suffix(200_000) + msg
        } else {
            text = msg
        }
        try? text.write(to: logURL, atomically: true, encoding: .utf8)
    }
}
