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

    /// 追加业务日志（JS 加载失败、游戏错误等，用于排障）；超过 256KB 自动清空重写，避免无限增长
    static func log(_ text: String) {
        let url = logURL
        if let attrs = try? FileManager.default.attributesOfItem(atPath: url.path),
           let size = (attrs[.size] as? NSNumber)?.intValue, size > 256 * 1024 {
            try? FileManager.default.removeItem(at: url)
        }
        guard let handle = try? FileHandle(forWritingTo: url) else {
            try? text.write(to: logURL, atomically: true, encoding: .utf8)
            return
        }
        defer { try? handle.close() }
        handle.seekToEndOfFile()
        if let d = ("[\(Date())] " + text + "\n").data(using: .utf8) {
            handle.write(d)
        }
    }
}
