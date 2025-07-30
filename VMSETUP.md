For the C09 project, we are giving you a VM with 4GB RAM, 2 vCPUs and 80 GB SSD Disk. 

This VM size should be big enough for your project. However, if you have specific needs, we can change the specs of the VM, however this will be done on case by case basis after a discussion with the instructor. Keep in mind that such an upgrade cannot be done last minute. You should assume that it will 3 full business days to implement the changes after the discussion with your instructor. 

There is no reason to have a deployment that require several VMs. Instead, use Docker to deploy multiple container of the same VM (the instructor can show you how to do that).

**[important]** Your VM is tied to your Github project. **Do not ever rename your Github project**. This will duplicate your VM and we might cut your access permanently.

1. **Get your SSH Public key** of your SSH client. 

    If you are on Linux or Mac it is the file `~/.ssh/id_rsa.pub` 

    The SSH public should look like this (*ed25519* version):

    ```
    ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKmnmPgELBZTuNV3FcdDOOBifTCl1C8BTPB0M8iLK7Kz john.doe@example.com
    ``` 

    or (*rsa* version)

    ```
    ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQCnc7TQ8ccdXDCsNXgX1eNtVwvIR110Gzcu6iC9ErR68f7GYF6rsDHmgOZut+6SyU7TEgGA6y6Tqt+9OMs5XV3Epj90IdhPMUNxgfHCaYf9EQczMKKcwkeoR/FhcypGMu4y8gOyYZedlaecSBEvddWmVEwyYXtLjW1X0e7CYGzdZVUDJ6V8cuBQB+rM6NMkcVYWS+ZPTpwZESselLAGwC8SjwjN/6OCyvTpnTaRwBiczbQOB8KbEWW+Paoex4z4rATJ8PLjPl5TQO24sYLWrQgWNHWvcdzbKYT8VSxmq70opMl6GlTyUCOwbbHjFW4k69pQCdoVv5rAEdv9la+s5frxdeDi+NltsA9UCKKzjciuTMxl2Oy8mC8cMv4DvbYEPW0+E2yaMXM3Et3UO58Z+uNnavJCFXIMT4le7czqU+Mwm4qZf5lTlmJeZHx+gVWAf9dm0RV/tPAkKmsnSr01l1/0xzPuhCCRTKjs20ELWAKD05Oeqmcfnk6rTZV6n7GtXnU= john.doe@example.com
    ```

    The last part if the key `john.doe@example.com` can be any kind of text string, it does not matter actually.

    You can share your public key with anyone and/or copy it on any machine. Nobody can do anything with just your public key. However, do keep your private key safe (`~/.ssh/id_rsa`). Never share or copy your private key anywhere.

    If you do not yet have a SSH key, you may follow instructions [here](https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent#generating-a-new-ssh-key) to generate one.

2. **Copy all SSH Public keys** in a file called `./SSH_KEYS` pushed to your Github project repo, the one created through Github Classroom. 

    Make sure to have one key per line. The `./SSH_KEYS` should look like this:

      ```
      ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIKmnmPgELBZTuNV3FcdDOOBifTCl1C8BTPB0M8iLK7Kz john.doe@example.com
      ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIAeCz0aA/FKnWUzssML1Eu2LtLuT9YgpYbjtf8UfM6AX jane.doe@example.com
      ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEdkyWGCfLva+23XyUtZ1NElPtXk/FfWKZk0GYZGuTU3 justa.doe@example.com
      ```

    FYI, there is a script that collects those keys and update your VM every hour. Therefore, once your file has been pushed to Github it can take up to 1h to get updated and grant you access to your VM.

3. **Get your VM IP address** that has been pushed to the file `VM_INFO` your Github project repo.

    Do not to delete this file. Otherwise, it will be pushed again to the repo automatically. 

4. **Access your VM** using your SSH client. 

    Replace `1.2.3.4` with the IP address found in your VM_INFO: 

    ```
    ssh root@1.2.3.4
    ```
    
    Or if you want to pass the public key to the command:
    
    ```
    ssh -i /path/to/my\_private\_key ssh root@1.2.3.4
    ```