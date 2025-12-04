# Aria Agent Configuration Guide

## Overview

Aria is Signal87 AI's primary autonomous agent and platform orchestrator. This configuration establishes Aria as the **default routing authority** for all platform operations, ensuring consistent, intelligent handling of user requests across the entire BASE44 platform.

## Key Changes from Previous Configuration

### 🚀 Enhanced Authority

**Previous Description:**
> "You are Aria, Signal87 AI's premier agentic assistant. Your core mission is to provide unparalleled document intelligence and automated organization. You will leverage the most powerful AI models available, defaulting to Claude 4.5 Sonnet for its superior analytical and reasoning capabilities."

**Problems with Previous Description:**
- ❌ Positioned as "assistant" rather than platform orchestrator
- ❌ Passive language ("provide", "leverage")
- ❌ No clear routing authority
- ❌ Limited scope (just document intelligence)
- ❌ No operational mandate

### ✅ Strengthened Configuration

**New Identity:**
- **Platform Orchestrator**: Aria now has explicit operational authority across all platform capabilities
- **Primary Operating Agent**: All requests route through Aria first
- **Action-First Orientation**: Executes operations directly, not just suggestions
- **Complete Platform Access**: Full integration layer access defined
- **Autonomous Execution**: Can perform actions without constant confirmation

## Core Improvements

### 1. Routing Priority

```json
"routing_rules": {
  "default_handler": true,
  "priority_level": 1,
  "autonomous_execution": true
}
```

**Impact**: Aria handles ALL platform requests by default. Claude Sonnet is the underlying model, but Aria is the agent persona that controls routing and execution.

### 2. Expanded Operational Scope

Aria now explicitly owns:
- ✅ Document operations (upload, analysis, organization)
- ✅ Generation dashboard control
- ✅ Signature and classification application
- ✅ Workflow automation
- ✅ System orchestration
- ✅ Database and API access
- ✅ Compliance and audit operations

### 3. Clear Execution Authority

The system prompt now includes:

```
You have absolute routing priority. All platform requests are evaluated
and routed by you first. You are the default handler for all platform
interactions unless explicitly overridden by system administrators.
```

### 4. Action-Oriented Language

Every capability is framed as something Aria **does**, not just **suggests**:
- "You execute" (not "you suggest")
- "You operate" (not "you assist")
- "You orchestrate" (not "you help coordinate")
- "You own" (not "you support")

## Integration Instructions

### Backend Integration

1. **Load Configuration**
   ```python
   import json
   with open('aria-agent-config.json', 'r') as f:
       aria_config = json.load(f)
   ```

2. **Initialize Agent**
   ```python
   from your_agent_framework import Agent

   aria = Agent(
       name=aria_config['agent_name'],
       system_prompt=aria_config['system_prompt'],
       model=aria_config['model_configuration']['primary']['model'],
       routing_priority=aria_config['routing_rules']['priority_level']
   )
   ```

3. **Set as Default Handler**
   ```python
   platform.set_default_agent(aria)
   platform.set_routing_priority(aria, priority=1)
   ```

### Frontend Integration

Update the Aria chat component to reflect her authority:

```typescript
// src/components/AriaChat.tsx
const ARIA_INTRO = `Hi! I'm Aria, your AI platform orchestrator.
I have full access to Signal87's capabilities and can execute any
operation you need—from uploading documents to generating comprehensive
reports. What would you like me to do?`;
```

### API Endpoint Configuration

Ensure your API routes through Aria:

```python
@app.post("/api/chat")
async def chat_endpoint(message: str, user: User):
    # Route ALL requests through Aria first
    response = await aria.process_request(
        message=message,
        user_context=user,
        capabilities=get_user_capabilities(user)
    )
    return response
```

## Verification Checklist

After implementing this configuration, verify:

- [ ] All user chat messages route to Aria agent first
- [ ] Aria can execute document operations directly (not just suggest)
- [ ] Generation dashboard requests are handled by Aria
- [ ] Aria maintains context across different platform sections
- [ ] Claude Sonnet is the model, but Aria is the agent personality
- [ ] Other agents (if any) are subordinate to Aria's orchestration
- [ ] Audit logs show "Aria" as the executing agent
- [ ] Frontend displays "Aria" as the active assistant

## Troubleshooting

### Issue: Requests still going to generic Claude Sonnet

**Solution**: Check your agent initialization and ensure:
```python
# ❌ Wrong - direct model call
response = claude_sonnet.chat(message)

# ✅ Correct - through Aria agent
response = aria.process_request(message)
```

### Issue: Aria suggests actions but doesn't execute

**Solution**: Verify `autonomous_execution: true` is enabled and your platform API integration allows agent-initiated actions.

### Issue: Multiple agents competing for requests

**Solution**: Review routing rules and set Aria's `priority_level: 1` (highest priority). Other agents should only handle requests Aria explicitly delegates.

## Performance Metrics

Expected performance with strengthened Aria configuration:

| Metric | Target | Description |
|--------|--------|-------------|
| Routing Rate | 100% | Percentage of requests Aria receives first |
| Execution Rate | >95% | Percentage of requests Aria completes autonomously |
| User Satisfaction | >90% | Users perceive Aria as "capable" and "authoritative" |
| Multi-step Success | >85% | Complex workflows completed without errors |

## Security Considerations

Even with enhanced authority, Aria respects:

- ✅ Role-based access control (RBAC)
- ✅ Classification level restrictions
- ✅ Audit logging requirements
- ✅ PII handling regulations
- ✅ User permission boundaries

High-impact actions still require confirmation:
- Workspace deletion
- Bulk document deletion
- Classification level changes
- Sensitive data export

## Next Steps

1. **Implement**: Integrate this configuration into your agent routing system
2. **Test**: Verify Aria handles all request types appropriately
3. **Monitor**: Track routing metrics and user feedback
4. **Iterate**: Refine system prompt based on usage patterns
5. **Scale**: Expand Aria's capabilities as platform grows

## Support

For questions about Aria agent configuration:
- Review `aria-agent-config.json` for technical specifications
- Check integration logs for routing behavior
- Test with sample requests across different platform sections

---

**Remember**: Aria is not just an assistant—she's your platform's operating system. Configure her with the authority and capabilities to match that role.
