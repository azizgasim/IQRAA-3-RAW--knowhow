# Writing blogs in docx format - specific formatting
Styling is specified by using specific liquid tags. For these to work properly you will need to follow the syntax exactly. To render a paragraph in a set style, add the tag on a new line in your docx file immediately following the paragraph that you would like to apply the styling to. For the style to work, the tag must appear on a new line, immediately following the paragraph that you would like to apply to styling to.

## Adding captions
If you would like the website to render a paragraph in the style of an image caption use the following tag on a new line following the paragraph that you would like rendered as a caption:
```
{: .figcaption }
```

In your docx file, the applied tag would look like this:
![image](https://github.com/mabarber92/openiti.github.io/assets/46000359/fbb42c5e-dde1-4d2f-96d5-ecd80dfff603)



# Instructions for adding blogs

## Fork the website repository
If you have not already forked this repository, click the fork option at the top right. 
If you already have a fork, go to that fork in your own GitHub (e.g. github.com/mabarber92/openiti.github.io) and update the fork, by clicking 'Sync fork' and 'Update Branch'. See below image:
![image](https://github.com/mabarber92/openiti.github.io/assets/46000359/a99d92b9-a67c-4f56-a468-4da98a857ea0)



## Set up a GitHub secret for the upload
If you are forking the repository for the first time, you will need to set up a dedicated secret (this is what the actions script uses to permit changes to your fork.
1. Go to your GitHub account (top right of GitHub), open the side bar by clicking on your user icon and then click settings
2. Click on 'Developer settings' (right at the bottom of the page in the left navigation bar)
3. Click on 'Personal access tokens' and in the dropdown click 'Tokens (classic)'
4. Click 'Generate new token' and in the dropdown 'Generate new token (classic)'
5. You will be prompted to enter your password
6. Add a note to help you remember what the token is for (e.g. 'openiti blog upload')
7. If you do not want to have to do this regularly, reset the expiration date for the token under 'expiration'
8. Click 'Generate token' at the bottom
9. You will be returned to the list of tokens - there you will see a string in a green box - click the copy button next to that string and keep it in a safe place (this is your access token)
10. Navigate back to your fork and click on the settings tab
11. Go to the 'Secrets and variables' tab in the left navigation and click 'Actions' in the dropdown
12. Click 'New repository secret'
13. In the 'Name' field type : BLOG_UPLOAD
14. Paste your access token into the 'Secret' field
15. Click 'Add secret'
16. All done - the blog upload process should now work without issue. Remember that if you set your token to expire you will need to repeat this process when the secret expires.


## Create a yml file for the blog post
The yml file is what describes your post and it's content. *Without a yml file, your blog will not be uploaded to the website*. For each docx file containing a blog, there should be a corresponding yml file. If uploading multiple blog posts at once, download the sample yml (new_header.yml) file from the input folder and use this as a template to produce yml files for each blog, and upload all in one go.

The yml file looks like this:
```
title: 
layout: post
banner: /assets/images/main-images/Isfahan_Lotfollah_mosque_ceiling_symmetric_narrow_border.png
author: 
docx: 
tags:
```

At an absolute minimum, you must fill out the title, author, and docx fields.

### What each field is used for
#### header
```
image: /assets/images/main-images/Isfahan_Lotfollah_mosque_ceiling_symmetric_narrow_border.png
```
This is a preset field and it sets the image that appears in the banner at the top of the page. If you change this, you will need to upload the corresponding image, set in 'overlay_image' to the images folder. It is recommended to put it in the 'covers' folder, if you do so.

#### title
```
title:
```
The title of the blog between quotation marks (remember when uploading your docx in the next step to remove the title of the blog post from the docx if it is present). For example:
```
title: 'Dispatches from al-Tabari part 1'
```
#### Author
```
author:
```
The author of the blog. This is written as plain text, as you would like it to appear on the website
```
author: 'Jonathan Parkes Allen'
```
#### layout
```
layout: post
```
This specifies the layout used by the website. **DO NOT CHANGE THIS**

#### tags
```
tags:
```
This field lists any tags you would like to associate with the blog. A list of existing tag codes are found below, but you can create new ones. For example:
```
tags:
 - text-reuse
 - book-history
 - author-practice
```
#### docx
```
docx:
```
Provide here the exact name of the docx file that is being uploaded into the input folder. **WARNING: If this name does not match the file name exactly, the upload will fail** For example:
```
docx: tabari_blog1.docx
```


## Add the word docx to the folder
Once you have created a yml file for each blog, you need to add the docx and yml files to the input folder. Navigate to the 'conversion_script' folder, and from there to the 'input' folder. Click the 'Add file' dropdown and click 'Upload files' button and drag and drop your docx files into the folder. For the conversion script to work, your files must be saved in 'docx' format. If you have already prepared your yml files, they can also be dropped into the input folder.

## Go to actions and run the workflow
1. Go to the 'actions' tab at the top of the page.
2. Once there, click on the 'Blogs workflow' on the left list of workflows. This will open the workflow page for converting the blogs.
3. On this page click the 'run workflow' button in the top right. See image:
   ![image](https://github.com/mabarber92/openiti.github.io/assets/46000359/396dbe09-b07c-4521-ac43-aae13722640c)
4. The workflow will take some time to run - if you wish to check its status click on the workflow in progress at the top of the page.
5. Once the blog has converted, a new workflow will automatically initiate called - 'Deploy Jekyll Site to Pages'
6. Click on this workflow in the left list
7. Click on the newly initiated workflow at the top of the page
8. Wait for the workflow to complete
9. Once the workflow is complete you will see the following:
    ![image](https://github.com/mabarber92/openiti.github.io/assets/46000359/34bd58ac-c886-42c1-9ed3-0b6ab55721a2)

**NOTE: If any of the workflows fail - notify Mathew Barber - we will work together on a fix**


## Check the test website and make corrections
1. Click on the link that appears on the page in step 9 above (this is the test instance of the website deployed on your own github)
2. Navigate to the blog on test instance and check everything has converted correctly
3. If there are errors in the conversion, you will need to correct them in markdown.
   1. Navigate to the _posts directory in your GitHub fork
   2. Locate the blog
   3. Edit the markdown and click commit to save the changes (you may wish to use the 'preview' tab to check that your markdown is formatting as expected)
   4. Commiting the changes will reinitiate the website build - return to step 5 in the above section to check on the deployment of your changes

## Submit a pull request to the main website
1. Once you are happy with how the blog post looks on your test instance, navigate to the 'Pull Requests' tab
2. Click 'New Pull Request'
3. Fill out the Pull Request as follows and click 'Create Pull request':
   ![image](https://github.com/mabarber92/openiti.github.io/assets/46000359/6a955e70-5ea6-4b66-bdae-68982d92de01)
5. It should say 'Merging can be performed automatically'
   ![image](https://github.com/mabarber92/openiti.github.io/assets/46000359/1504fd3f-1033-45ed-8ec8-37035ed9b4ee)
7. Click 'Merge' to Merge your changes onto the main OpenITI website
8. Wait a few minutes and check the main OpenITI website to see that your changes have taken effect



