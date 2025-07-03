![Banner image](https://user-images.githubusercontent.com/10284570/173569848-c624317f-42b1-45a6-ab09-f0ea3c247648.png)

# n8n-nodes-better-send-mail

This node adds the following improvements to the default SMTP Send Email node.
  - User-defined Custom Headers

## How to Reply To Email Threads

Use custom headers to reply in threads.

If you plug in an IMAP trigger, plug it into "Better Send Mail" and add these expressions to the custom headers.

Name: References

Value: `{{ $json.metadata.references ? $json.metadata.references + ' ' + $json.metadata['message-id'] : '' }}`

Name: In-Reply-To

Value: `{{ $json.metadata['message-id'] }}`

❗IMPORTANT
"References" must come before "In-Reply-To" for proper first-message replies. Tested on Gmail.

## License

[MIT](https://github.com/n8n-io/n8n-nodes-starter/blob/master/LICENSE.md)
