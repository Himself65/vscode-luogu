"use strict";

import * as vscode from 'vscode';
import * as path from 'path';
import { submitSolution } from '../utils/api';

/**
 * 提交题目答案
 */
export async function submit(channel: vscode.OutputChannel, uri?: vscode.Uri): Promise<void> {
    let edtior = vscode.window.activeTextEditor;
    if (!edtior) { vscode.window.showErrorMessage('您没有打开任何文件，请重试'); return; }
    let text = edtior.document.getText();
    const filePath = edtior.document.fileName;
    const O2: boolean = await vscode.window.showQuickPick(['是', '否'], { placeHolder: '是否开启O2优化 (非 C/C++/Pascal 切勿开启)' }).then(ans => {
        if (ans === '是') {
            return true;
        } else {
            return false;
        }
    });
    if (O2) {
        text = `// luogu-judger-enable-o2 \n ${text}`;
    }
    const fileFName = path.parse(filePath).base;
    const id = await vscode.window.showInputBox({ placeHolder: '输入提交到的题目ID' });
    try {
        vscode.window.showInformationMessage(`${fileFName}正在提交到${id}到洛谷...`);
        await submitSolution(id, text, 0, O2).then(rid => {
            vscode.window.showInformationMessage('提交成功');
            const url = `https://www.luogu.org/record/show?rid=${rid}`;
            let pannel = vscode.window.createWebviewPanel(`${rid}`, `${rid}`, vscode.ViewColumn.Two);
            let html = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${rid}</title>
        </head>
        <body>
        <h1>请手动打开链接</h1>
        <a href=${url} target="_blank">${rid}</a>
        </body>
        </html>`;
            pannel.webview.html = html;
        });
    } catch (error) {
        console.error(error);
    }
}
