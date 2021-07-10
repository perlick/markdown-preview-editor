import * as vscode from 'vscode';

export class ClassicEditorProvider implements vscode.CustomTextEditorProvider {

    public static register(context: vscode.ExtensionContext): vscode.Disposable {
		const provider = new ClassicEditorProvider(context);
		const providerRegistration = vscode.window.registerCustomEditorProvider(ClassicEditorProvider.viewType, provider);
		return providerRegistration;
	}

    private static readonly viewType = 'markdown-preview-editor.classicEditor';

    constructor(
		private readonly context: vscode.ExtensionContext
	) { }

    //Called when our custom editor is opened.
    public async resolveCustomTextEditor(
		document: vscode.TextDocument,
		webviewPanel: vscode.WebviewPanel,
		_token: vscode.CancellationToken
	): Promise<void> {
		// Setup initial content for the webview
		webviewPanel.webview.options = {
			enableScripts: true,
		};
		webviewPanel.webview.html = this.getHtmlForWebview(webviewPanel.webview, document);

		webviewPanel.webview.onDidReceiveMessage(e => {
			switch (e.type) {
				case 'data.change':
					console.log("vcode received message");
					console.log(e.data);
					this.updateTextDocument(document, e.data);
					return;
			}
		});
	}

    /**
	 * Get the static html used for the editor webviews.
	 */
	private getHtmlForWebview(webview: vscode.Webview, document: vscode.TextDocument): string {
		const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(
			this.context.extensionUri, 'node_modules', '@ckeditor', 'ckeditor5-build-classic', 'build',  'ckeditor.js'));

		return /* html */`
			<!DOCTYPE html>
			<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>Markdown Editor</title>
			</head>
			<body>
            <div id="editor">${document.getText()}</div>

                <script src="${scriptUri}"></script>
				<script>
					const vscode = acquireVsCodeApi();
					
					ClassicEditor
						.create( document.querySelector( '#editor' ) )
						.then( editor => {
							editor.model.document.on( 'change:data', () => {
								console.log( 'The data has changed!' );
								vscode.postMessage({
									type: 'data.change',
									data: editor.getData()
								});
							} );
						} )
						.catch( error => {
							console.error( error );
						} );
				</script>
			</body>
			</html>`;
	}

	private updateTextDocument(document: vscode.TextDocument, md: any) {
		const edit = new vscode.WorkspaceEdit();

		// todo: compute minimal edits
		edit.replace(
			document.uri,
			new vscode.Range(0, 0, document.lineCount, 0),
			md);

		return vscode.workspace.applyEdit(edit);
	}
}