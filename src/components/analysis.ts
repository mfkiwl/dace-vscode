import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';

import { BaseComponent } from './baseComponent';
import { ComponentMessageHandler } from './messaging/componentMessageHandler';

export class AnalysisProvider
extends BaseComponent
implements vscode.WebviewViewProvider {

    private static readonly viewType: string = 'sdfgAnalysis';

    private view?: vscode.WebviewView;

    private static INSTANCE: AnalysisProvider | undefined = undefined;

    public static register(ctx: vscode.ExtensionContext): vscode.Disposable {
        AnalysisProvider.INSTANCE = new AnalysisProvider(ctx);
        const options: vscode.WebviewPanelOptions = {
            retainContextWhenHidden: false,
        };
        return vscode.window.registerWebviewViewProvider(
            AnalysisProvider.viewType,
            AnalysisProvider.INSTANCE,
            {
                webviewOptions: options,
            }
        );
    }

    public static getInstance(): AnalysisProvider | undefined {
        return this.INSTANCE;
    }

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken
    ) {
        this.view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.file(path.join(
                    this.context.extensionPath, 'media'
                )),
            ],
        };

        const fpBaseHtml: vscode.Uri = vscode.Uri.file(path.join(
            this.context.extensionPath,
            'media',
            'components',
            'analysis',
            'index.html'
        ));
        const fpMediaFolder: vscode.Uri = vscode.Uri.file(path.join(
            this.context.extensionPath, 'media'
        ));
        let baseHtml = fs.readFileSync(fpBaseHtml.fsPath, 'utf8');
        baseHtml = baseHtml.replace(
            this.csrSrcIdentifier,
            webviewView.webview.asWebviewUri(fpMediaFolder).toString()
        );
        webviewView.webview.html = baseHtml;

        webviewView.webview.onDidReceiveMessage(message => {
            ComponentMessageHandler.getInstance().handleMessage(
                message,
                webviewView.webview
            );
        });
    }

    public handleMessage(message: any, origin: vscode.Webview): void {
        switch (message.type) {
            default:
                this.view?.webview.postMessage(message);
                break;
        }
    }

    public clear(reason: string | undefined) {
        this.view?.webview.postMessage({
            type: 'clear',
            reason: reason,
        });
    }

    public refresh() {
        vscode.commands.executeCommand('sdfgAnalysis.sync');
    }

}