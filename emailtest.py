import smtplib

confirmation_link = "http://vmedu265.mtacloud.co.il/confirm-email/{}"
sender_email = "chenkuchiersky@gmail.com"
sender_password = "caauknmafaaglhhl"
receiver_email = "chenkuchiersky@gmail.com"
subject = "Confirm Your Email Address"
body = "Please click on the following link to confirm your email address: {}".format(confirmation_link)

# Establish a secure session with gmail's outgoing SMTP server using your gmail account
smtp_server = smtplib.SMTP('smtp.gmail.com', 587)
smtp_server.starttls()
smtp_server.login(sender_email, sender_password)

# Send email
message = f"Subject: {subject}\n\n{body}"
smtp_server.sendmail(sender_email, receiver_email, message)

# Close SMTP connection
smtp_server.quit()
