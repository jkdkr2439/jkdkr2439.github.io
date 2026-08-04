import unittest
from pathlib import Path, PurePosixPath


class WritingCommandTest(unittest.TestCase):
    def test_linux_invokes_bundler_without_windows_command_shell(self) -> None:
        from P_Process.build.build_writing import _bundle_process_command

        command = _bundle_process_command(PurePosixPath('/usr/bin/bundle'), ['exec', 'jekyll'], platform_name='posix')
        self.assertEqual(['/usr/bin/bundle', 'exec', 'jekyll'], command)

    def test_windows_wraps_bundle_batch_file_with_comspec(self) -> None:
        from P_Process.build.build_writing import _bundle_process_command

        command = _bundle_process_command(Path(r'C:\Ruby32\bin\bundle.bat'), ['exec', 'jekyll'], platform_name='nt', comspec='cmd.exe')
        self.assertEqual(['cmd.exe', '/d', '/c', r'C:\Ruby32\bin\bundle.bat', 'exec', 'jekyll'], command)


if __name__ == '__main__':
    unittest.main()
