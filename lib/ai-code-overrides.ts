import type { AILongFormConcept } from './ai-long-form';
export function applyAICodeOverrides(items: AILongFormConcept[]) {
  const set = (slug: string, examples: AILongFormConcept['codeExamples']) => {
    const item = items.find((x) => x.slug === slug);
    if (item) item.codeExamples = examples;
  };
  set('handoffs', [
    {
      title: 'Agents SDK：分流 Agent 把会话交给专家',
      language: 'TypeScript' as never,
      purpose:
        '对应 OpenAI Agents SDK TypeScript 当前 Handoff 结构。仅展示，不在本站运行；实际运行需要按官方文档配置 SDK 与模型访问。',
      source: `import { Agent, run } from '@openai/agents';\n\nconst chineseAgent = new Agent({\n  name: 'Chinese specialist',\n  instructions: 'Reply in Chinese and keep technical terms precise.',\n});\n\nconst englishAgent = new Agent({\n  name: 'English specialist',\n  instructions: 'Reply in English.',\n});\n\nconst triageAgent = new Agent({\n  name: 'Language triage',\n  instructions: 'Hand off to the specialist matching the user language.',\n  handoffs: [chineseAgent, englishAgent],\n});\n\nconst result = await run(triageAgent, '请解释 Handoff。');\nconsole.log(result.finalOutput);`,
      explanation: [
        '两个专家有独立 instructions。',
        'triageAgent 的 handoffs 声明可交接目标。',
        'run 内部处理模型调用、交接与后续 Agent 循环；最终输出来自接管后的 Agent。',
      ],
      expectedOutput: '中文专家接管并返回中文解释；实际文本由所配置模型决定。',
    },
  ]);
  set('single-vs-multi-agent', [
    {
      title: 'Manager 并行调用两个专业 Agent',
      language: 'TypeScript' as never,
      purpose:
        '展示独立子任务并行和 Manager 聚合的边界；代码遵循 Agents SDK 当前 Agent/run 基本结构。',
      source: `import { Agent, run } from '@openai/agents';\n\nconst evidenceAgent = new Agent({\n  name: 'Evidence reviewer',\n  instructions: 'Return claims with supporting evidence only.',\n});\nconst riskAgent = new Agent({\n  name: 'Risk reviewer',\n  instructions: 'List security and reliability risks.',\n});\n\nconst task = 'Review this local design summary.';\nconst [evidence, risks] = await Promise.all([\n  run(evidenceAgent, task),\n  run(riskAgent, task),\n]);\n\nconst managerInput = JSON.stringify({\n  evidence: evidence.finalOutput,\n  risks: risks.finalOutput,\n});\nconsole.log(managerInput);`,
      explanation: [
        '两个子任务独立，因此用 Promise.all 并行。',
        '每个 run 有自己的 Agent 指令和结果。',
        '聚合数据先结构化；真实 Manager 还应验证证据、处理失败与限制敏感信息。',
      ],
      expectedOutput:
        '包含 evidence 与 risks 两个字段的 JSON 字符串；内容取决于所配置模型。',
    },
  ]);
  set('local-mcp-server', [
    {
      title: '本地 MCP 消息流：Server 与 Client 的最小可复现模型',
      language: 'Python',
      purpose:
        '不依赖网络或第三方 SDK，用队列完整演示 initialize、tools/list 与 tools/call 的请求—响应结构；这是协议教学模型，不宣称替代完整 MCP SDK。',
      source: `from queue import Queue\n\nrequests = Queue()\nresponses = Queue()\n\ndef server_once():\n    message = requests.get()\n    method = message["method"]\n    if method == "initialize":\n        result = {"protocolVersion": "2026-07-28", "capabilities": {"tools": {}}}\n    elif method == "tools/list":\n        result = {"tools": [{"name": "read_note", "readOnly": True}]}\n    elif method == "tools/call":\n        args = message["params"]["arguments"]\n        if not args["path"].startswith("notes/"):\n            raise PermissionError("path is outside the allowed root")\n        result = {"content": [{"type": "text", "text": "local note"}]}\n    else:\n        raise ValueError(f"unsupported method: {method}")\n    responses.put({"jsonrpc": "2.0", "id": message["id"], "result": result})\n\ndef client_call(method, params=None):\n    requests.put({"jsonrpc": "2.0", "id": 1, "method": method, "params": params or {}})\n    server_once()\n    return responses.get()\n\nprint(client_call("initialize"))\nprint(client_call("tools/list"))\nprint(client_call("tools/call", {\n    "name": "read_note",\n    "arguments": {"path": "notes/agent.md"},\n}))`,
      explanation: [
        'Queue 代替 stdio/HTTP，只保留 Client 发请求、Server 回响应的核心数据流。',
        'initialize 声明协议版本与能力；tools/list 用于发现；tools/call 携带工具名和参数。',
        '路径校验发生在 Server 执行层，readOnly 元数据不能替代真实授权。',
      ],
      expectedOutput:
        '依次打印初始化能力、只读工具目录和 local note 内容；越过 notes/ 根目录会抛出 PermissionError。',
    },
  ]);
  return items;
}
